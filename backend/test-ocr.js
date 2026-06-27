require('dotenv').config();
const Groq = require('groq-sdk');
const Tesseract = require('tesseract.js');
const fs = require('fs');

async function testOCR() {
    try {
        const imgBuffer = fs.readFileSync('C:/Users/priya.LAPTOP-EG20JU6U/.gemini/antigravity-ide/brain/ee5bbede-aaf3-4c83-b76e-2f700d5578b3/uploaded_media_1782535565293.png');
        
        console.log("Starting OCR with Tesseract...");
        const worker = await Tesseract.createWorker('eng');
        const { data: { text } } = await worker.recognize(imgBuffer);
        await worker.terminate();
        
        console.log("OCR Extracted text length:", text.length);
        console.log("--- OCR TEXT ---");
        console.log(text);
        console.log("----------------");

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const prompt = `
            Analyze this extracted text from a document (quote, invoice, or bill of materials).
            Extract the following information:
            1. customer_name (string, name of the client/customer, if found)
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
            Example: {"customer_name": "Acme Corp", "date": "2026-06-27", "items": [{"item_name":"Widget A","hsn":"8471","qty":10,"unit":"Nos","unit_price":1500,"gst_percent":18}]}
            
            Here is the extracted document text:
            """
            ${text}
            """
        `;

        console.log("Calling Groq LLM...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";
        console.log("--- GROQ RESPONSE ---");
        console.log(responseText);
        
    } catch (e) {
        console.error("ERROR:", e);
    }
}
testOCR();
