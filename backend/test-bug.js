require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testExtract() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Analyze this document (which is a quote, invoice, or bill of materials).
            Extract the following information:
            1. customer_name (string, name of the client/customer/buyer. Look for "Invoice To", "Billed To", "Name:", "Sold To" and extract the full name of the person or company. If not found, leave as empty string.)
            2. date (string, document date in YYYY-MM-DD format, if found)
            3. items (array of objects, the line items from the table)
            
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

        // Dummy image for testing
        const imageParts = [{
            inlineData: {
                data: Buffer.from("dummy").toString("base64"),
                mimeType: "image/png"
            }
        }];

        console.log("Calling model...");
        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        console.log("Response text:", responseText);
        const parsedData = JSON.parse(responseText.replace(/```json/gi, '').replace(/```/gi, '').trim());
        console.log("Parsed OK!");
    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    }
}
testExtract();
