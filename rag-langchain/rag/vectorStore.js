import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {OpenAIEmbeddings} from '@langchain/openai';
import { loadDocs } from "./loader.js";

let vectorStore;

export async function initVectorStore() {
    const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith("sk-or-");
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        configuration: isOpenRouter ? { baseURL: "https://openrouter.ai/api/v1" } : undefined,
    });
    const docs = await loadDocs();
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
}

export function getRetriever() {
    if (!vectorStore) {
        throw new Error('Vector store not initialized. Call initVectorStore() first.');
    }
    return vectorStore.asRetriever({
        k : 3,
    });
}

