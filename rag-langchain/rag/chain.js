import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { formatDocumentsAsString } from "langchain/util/document";
import { getRetriever } from "./vectorStore.js";

export function createQAChain() {
    // 1. Re-define isOpenRouter
    const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith("sk-or-");

    const model = new ChatOpenAI({
        temperature: 0.7,
        modelName: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini", // Fixed property name 'modelName'
        apiKey: process.env.OPENAI_API_KEY,
        configuration: isOpenRouter ? { baseURL: "https://openrouter.ai/api/v1" } : undefined,
    });

    const retriever = getRetriever();

    // 2. Use a proper Template
    const prompt = ChatPromptTemplate.fromTemplate(`
        Answer ONLY from context. If not found, say I don’t know.
        
        Context:
        {context}
        
        Question:
        {question}
    `);

    // 3. Structured Sequence
    return RunnableSequence.from([
        {
            // This runs the retriever and formats the results, 
            // while passing the original question through.
            context: (input) => retriever.invoke(input.question).then(formatDocumentsAsString),
            question: (input) => input.question,
        },
        prompt,
        model,
        new StringOutputParser(), // This extracts the string automatically
    ]);
}
