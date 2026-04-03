import {ChatOpenAI} from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { getRetriever } from "./vectorStore.js";

export function createQAChain() {
    const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith("sk-or-");
    const model = new ChatOpenAI({
        temperature: 0.9,
        modelName: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        apiKey: process.env.OPENAI_API_KEY,
        configuration: isOpenRouter ? { baseURL: "https://openrouter.ai/api/v1" } : undefined,
    });

    const retriever = getRetriever();
    
    return RetrievalQAChain.fromLLM(model, retriever);
}

