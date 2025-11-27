const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

async function run() {
    try {
        // Load env vars manually
        const envPath = path.join(__dirname, ".env.local");
        if (!fs.existsSync(envPath)) {
            console.error(".env.local not found");
            process.exit(1);
        }
        const envContent = fs.readFileSync(envPath, "utf8");
        const envVars = {};
        envContent.split("\n").forEach(line => {
            const parts = line.split("=");
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join("=").trim().replace(/^"|"$/g, ''); // Remove quotes
                envVars[key] = value;
            }
        });

        const apiKey = envVars.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_API_KEY not found in .env.local");
            process.exit(1);
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Test the model name used in the code
        const modelName = "gemini-2.5-flash";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);

    } catch (error) {
        console.error("Error:", error.message);
        fs.writeFileSync("error.log", error.message);
    }
}

run();
