const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const axios = require('axios');

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log(`Checking API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Missing'}`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await axios.get(url);
        console.log("✅ Models List Success:", response.data.models.map(m => m.name));
    } catch (error) {
        console.error("❌ API Request Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

listModels();
