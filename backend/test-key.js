require('dotenv').config();

async function testKey() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing Key:", key.substring(0, 8) + "...");
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            console.log("HTTP ERROR:", response.status, response.statusText);
            const text = await response.text();
            console.log("BODY:", text);
            return;
        }
        const data = await response.json();
        console.log("Models found:", data.models.length);
        console.log("First few models:", data.models.slice(0, 5).map(m => m.name));
        
        const flashModel = data.models.find(m => m.name.includes("gemini-1.5-flash"));
        console.log("Flash Model:", flashModel);
    } catch (e) {
        console.log("Fetch Error:", e);
    }
}
testKey();
