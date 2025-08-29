import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function embedChunks(chunks) {
    const embeddings = [];
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        // Correct usage: call genAI.models.embedContent
        const result = await genAI.models.embedContent({
            model: "gemini-embedding-001",
            contents: batch
        });

        embeddings.push(...result.embeddings);
    }
    console.log("embeddings generated are : ", embeddings);
    return embeddings;
}
