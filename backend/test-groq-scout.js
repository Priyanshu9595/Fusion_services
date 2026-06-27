require('dotenv').config();
const Groq = require('groq-sdk');
const fs = require('fs');

async function testGroqScout() {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const imgBuffer = fs.readFileSync('C:/Users/priya.LAPTOP-EG20JU6U/.gemini/antigravity-ide/brain/ee5bbede-aaf3-4c83-b76e-2f700d5578b3/uploaded_media_1782535565293.png');
        
        const prompt = "What is this image? Just return a 1 sentence answer.";
        
        console.log("Calling Groq Llama 4 Scout...");
        const result = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${imgBuffer.toString('base64')}`,
                            },
                        },
                    ],
                }
            ],
            temperature: 0,
        });
        
        console.log("Response:", result.choices[0].message.content);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
testGroqScout();
