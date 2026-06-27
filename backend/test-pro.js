require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testPro() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        console.log("Calling model gemini-2.5-pro...");
        const result = await model.generateContent("Hello!");
        console.log("Response text:", result.response.text());
    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    }
}
testPro();
