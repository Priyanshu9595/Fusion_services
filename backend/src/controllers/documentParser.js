exports.parseDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
             return res.status(500).json({ error: 'Groq API key is not configured on the server' });
        }

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
            - unit_price (number, unit price or rate)
            - gst_percent (number, GST percentage e.g. 18, 5, 12, 28, or 0. Default to 18 if not found).
            
            Return the result STRICTLY as a single JSON object. Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.
            Example: {"customer_name": "Priyanshu Raj", "date": "2026-06-27", "items": [{"item_name":"Widget A","hsn":"8471","qty":10,"unit":"Nos","unit_price":1500,"gst_percent":18}]}
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

        // Enforce defaults in code just in case AI missed it
        if (parsedData.items && Array.isArray(parsedData.items)) {
            parsedData.items = parsedData.items.map(item => ({
                ...item,
                gst_percent: (item.gst_percent !== undefined && item.gst_percent !== null && item.gst_percent !== "") 
                    ? Number(item.gst_percent) 
                    : 18
            }));
        }

        res.json(parsedData);
    } catch (error) {
        console.error('Error parsing document with Groq:', error);
        res.status(500).json({ error: 'Failed to process document with AI: ' + (error.message || error.toString()) });
    }
};
