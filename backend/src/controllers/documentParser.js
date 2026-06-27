exports.parseDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const apiKey = process.env.GROQ_API_KEY;

        const mimeType = req.file.mimetype;
        const buffer = req.file.buffer;

        // Ensure it's image or pdf
        if (!mimeType.startsWith('image/') && mimeType !== 'application/pdf') {
             return res.status(400).json({ error: 'Invalid file type. Only images and PDFs are supported.' });
        }

        const prompt = `
            Analyze this document (which is a quote, invoice, or bill of materials).
            Extract the following information:
            1. customer_name (string, name of the client/customer/buyer. Look for "Invoice To", "Billed To", "Name:", "Sold To" and extract the full name of the person or company. If not found, leave as empty string.)
            2. customer_phone (string, phone number or mobile number of the client/customer. Extract just the number digits or with +91 if found. Leave empty if not found.)
            3. date (string, document date in YYYY-MM-DD format, if found)
            4. items (array of objects, the line items from the table)
            
            For each item in the items array, extract:
            - item_name (string, description of the item)
            - hsn (string, HSN/SAC code if available, otherwise empty string)
            - qty (number, quantity)
            - unit (string, e.g. Nos, kg, Ltr, usually Nos)
            - unit_price (number, unit price or rate before GST)
            - gst_percent (number, use only one of 5, 12, 18, 28. Default to 18 if GST is missing, blank, zero, unclear, or unreadable.)
            - line_total (number, final line amount including GST if visible; otherwise calculate qty * unit_price + GST)

            Important:
            - Do not use 0 for GST unless the document explicitly says GST exempt. For normal products, missing GST means 18.
            - If OCR reads weird GST like 1.5, 1.8, 8, or blank, treat it as 18.
            - Preserve full product names. Do not merge multiple products into one row.
            
            Return the result STRICTLY as a single JSON object. Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.
            Example: {"customer_name": "Priyanshu Raj", "date": "2026-06-27", "items": [{"item_name":"Widget A","hsn":"8471","qty":10,"unit":"Nos","unit_price":1500,"gst_percent":18,"line_total":17700}]}
        `;

        let responseText = "";
        let attempt = 0;
        const maxRetries = 3;
        
        let extractedPdfText = "";
        if (mimeType === 'application/pdf') {
            try {
                const pdfParse = require('pdf-parse');
                const pdfData = await pdfParse(buffer);
                extractedPdfText = pdfData.text;
            } catch (e) {
                return res.status(500).json({ error: 'Failed to extract text from PDF: ' + e.message });
            }
        }

        const fallbackItems = mimeType === 'application/pdf' ? extractItemsFromText(extractedPdfText) : [];
        const fallbackPayload = {
            customer_name: inferCustomerName(extractedPdfText),
            customer_phone: inferPhone(extractedPdfText),
            date: inferDate(extractedPdfText),
            items: normalizeParsedItems(fallbackItems)
        };

        if (!apiKey) {
            if (fallbackPayload.items.length) return res.json(fallbackPayload);
            return res.status(500).json({ error: 'Groq API key is not configured on the server' });
        }

        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey });

        while (attempt < maxRetries) {
            try {
                let messages = [];
                let model = "";

                if (mimeType === 'application/pdf') {
                    model = "llama-3.3-70b-versatile"; // Text-only model for PDFs
                    messages = [
                        {
                            role: "user",
                            content: prompt + "\n\nDocument Text:\n" + extractedPdfText
                        }
                    ];
                } else {
                    model = "meta-llama/llama-4-scout-17b-16e-instruct"; // Vision model for Images
                    messages = [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${buffer.toString('base64')}`,
                                    },
                                },
                            ],
                        }
                    ];
                }

                const result = await groq.chat.completions.create({
                    model: model,
                    messages: messages,
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                });
                
                responseText = result.choices[0].message.content;
                break;
            } catch (apiError) {
                attempt++;
                console.error(`Groq Attempt ${attempt} failed:`, apiError.message);
                if (attempt >= maxRetries) {
                    if (fallbackPayload.items.length) return res.json(fallbackPayload);
                    throw new Error(`Groq AI is temporarily overloaded after ${maxRetries} tries. Original Error: ${apiError.message}`);
                }
                await new Promise(res => setTimeout(res, 2000));
            }
        }
        
        // Robust and FAST JSON extraction
        let jsonStr = responseText;
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = responseText.substring(firstBrace, lastBrace + 1);
        } else {
            // cleanup markdown
            jsonStr = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        }

        const parsedData = JSON.parse(jsonStr);

        parsedData.customer_name = parsedData.customer_name || fallbackPayload.customer_name;
        parsedData.customer_phone = parsedData.customer_phone || fallbackPayload.customer_phone;
        parsedData.date = parsedData.date || fallbackPayload.date;
        parsedData.items = normalizeParsedItems(parsedData.items, fallbackItems);

        res.json(parsedData);
    } catch (error) {
        console.error('Error parsing document with Groq:', error);
        res.status(500).json({ error: 'Failed to process document with AI: ' + (error.message || error.toString()) });
    }
};

const normalizeParsedGst = (value) => {
    const parsed = Number(value);
    const allowedRates = [5, 12, 18, 28];
    if (!Number.isFinite(parsed) || parsed <= 0) return 18;
    if (!allowedRates.includes(parsed)) return 18;
    return parsed;
};

const normalizeParsedItems = (aiItems, fallbackItems = []) => {
    const sourceItems = Array.isArray(aiItems) && aiItems.length ? aiItems : fallbackItems;
    return sourceItems
        .map((item) => normalizeParsedItem(item))
        .filter((item) => item.item_name && item.qty > 0);
};

const normalizeParsedItem = (item = {}) => {
    const qty = positiveNumber(item.qty, 1);
    const gstPercent = normalizeParsedGst(item.gst_percent);
    let unitPrice = positiveNumber(item.unit_price, 0);
    const providedTotal = positiveNumber(item.line_total || item.total || item.amount, 0);

    if (!unitPrice && providedTotal) {
        unitPrice = Number((providedTotal / (1 + gstPercent / 100) / qty).toFixed(2));
    }

    const lineSubtotal = Number((qty * unitPrice).toFixed(2));
    const lineGstAmount = Number(((lineSubtotal * gstPercent) / 100).toFixed(2));
    const calculatedTotal = Number((lineSubtotal + lineGstAmount).toFixed(2));

    return {
        item_name: cleanText(item.item_name || item.name || item.description || ''),
        hsn: cleanText(item.hsn || item.hsn_code || ''),
        qty,
        unit: cleanText(item.unit || 'Nos') || 'Nos',
        unit_price: unitPrice,
        gst_percent: gstPercent,
        line_subtotal: lineSubtotal,
        line_gst_amount: lineGstAmount,
        line_total: calculatedTotal
    };
};

const extractItemsFromText = (text = '') => {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

    return lines.map((line) => {
        const numbers = [...line.matchAll(/(?:₹|rs\.?\s*)?(\d+(?:,\d{2,3})*(?:\.\d+)?)/gi)]
            .map((match) => Number(match[1].replace(/,/g, '')))
            .filter(Number.isFinite);

        if (numbers.length < 2 || !/[a-zA-Z]/.test(line)) return null;

        const qty = numbers[0] || 1;
        const unitPrice = numbers.length >= 3 ? numbers[numbers.length - 2] : numbers[numbers.length - 1];
        const lineTotal = numbers[numbers.length - 1];
        const name = line
            .replace(/(?:₹|rs\.?\s*)?\d+(?:,\d{2,3})*(?:\.\d+)?/gi, ' ')
            .replace(/\b(nos|pcs|kg|ltr|unit|qty|rate|amount|total|gst|hsn)\b/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!name || unitPrice <= 0) return null;

        return {
            item_name: name,
            qty,
            unit: /\bkg\b/i.test(line) ? 'Kg' : 'Nos',
            unit_price: unitPrice,
            gst_percent: 18,
            line_total: lineTotal
        };
    }).filter(Boolean);
};

const positiveNumber = (value, fallback = 0) => {
    const parsed = Number(String(value ?? '').replace(/,/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const cleanText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const inferPhone = (text = '') => {
    const match = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/);
    return match ? match[0].replace(/\s+/g, '') : '';
};

const inferDate = (text = '') => {
    const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, '0')}-${String(iso[3]).padStart(2, '0')}`;

    const indian = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
    if (indian) return `${indian[3]}-${String(indian[2]).padStart(2, '0')}-${String(indian[1]).padStart(2, '0')}`;

    return '';
};

const inferCustomerName = (text = '') => {
    const lines = text.split(/\r?\n/).map(cleanText).filter(Boolean);
    const labelIndex = lines.findIndex((line) => /(billed to|bill to|invoice to|customer|sold to|name)/i.test(line));
    if (labelIndex !== -1) {
        const sameLine = lines[labelIndex].split(/:|-/).slice(1).join(' ').trim();
        if (sameLine && /[a-z]/i.test(sameLine)) return sameLine;
        const nextLine = lines[labelIndex + 1];
        if (nextLine && /[a-z]/i.test(nextLine) && !/\d{4,}/.test(nextLine)) return nextLine;
    }
    return '';
};
