import axios from "axios";
import { env } from "../config/env.js";

export const getEmbedding = async (text: string): Promise<number[]> => {
    try {
        console.log("Generating embedding for text of length:", text.length);
        const response = await axios.post(
            "https://openrouter.ai/api/v1/embeddings",
            {
                model: "openai/text-embedding-3-small",
                input: text
            },
            {
                headers: {
                    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://rag-nodejs.onrender.com", // Required for some OpenRouter environments
                    "X-Title": "RAG Backend", // Optional but recommended
                },
            }
        )
        const embedding = response.data.data[0].embedding;
        return embedding;
    } catch (error: any) {

        const errorData = error.response?.data;
        console.error("Embedding API error:", JSON.stringify(errorData, null, 2) || error.message);

        const openRouterError = errorData?.error?.message || error.message;
        throw new Error(`Failed to generate embedding: ${openRouterError}`);
    }
};