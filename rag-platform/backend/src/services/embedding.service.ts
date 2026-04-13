import axios from "axios";
import { env } from "../config/env.js";

export const getEmbedding = async (texts: string[]): Promise<number[][]> => {
    try {
        console.log("Generating embeddings for", texts.length, "texts");
        const response = await axios.post(
            "https://openrouter.ai/api/v1/embeddings",
            {
                model: "openai/text-embedding-3-small",
                input: texts
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
        const embeddings = response.data.data.map((item: any) => item.embedding);

        
        console.log(`Generated ${embeddings.length} embeddings`);
        return embeddings;
    } catch (error: any) {

        const errorData = error.response?.data;
        console.error("Embedding API error:", JSON.stringify(errorData, null, 2) || error.message);

        const openRouterError = errorData?.error?.message || error.message;
        throw new Error(`Failed to generate embedding: ${openRouterError}`);
    }
};