require('dotenv').config();
const Groq = require('groq-sdk');
const fs = require('fs');

async function testGroq() {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const imgBuffer = fs.readFileSync('c:/Users/priya.LAPTOP-EG20JU6U/.gemini/antigravity-ide/brain/ee5bbede-aaf3-4c83-b76e-2f700d5578b3/uploaded_media_1782534736206.png');
        const base64Data = imgBuffer.toString('base64');
        
        console.log("Calling Groq...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image? Reply in JSON." },
                        {
                            type: "image_url",
                            image_url: { url: `data:image/png;base64,${base64Data}` }
                        }
                    ]
                }
            ],
            model: "llama-3.2-90b-vision",
        });
        console.log(chatCompletion.choices[0]?.message?.content);
    } catch (e) {
        console.error("GROQ ERROR:", e);
    }
}
testGroq();
