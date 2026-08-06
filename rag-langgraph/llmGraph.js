import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

// Initialize LLM using OpenRouter
const model = new ChatOpenAI({
  modelName: "google/gemma-4-26b-a4b-it:free",
  temperature: 0.7,
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "LangGraph JS",
    },
  },
});

// 1. Define State Annotation
// State holds array of conversation messages and final response summary
const GraphAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  summary: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
});

// 2. Node: Call LLM
async function callLlmNode(state) {
  console.log("🤖 Running LLM Node...");
  const response = await model.invoke(state.messages);
  return {
    messages: [response],
  };
}

// 3. Node: Summarize Response
async function summarizeNode(state) {
  console.log("📝 Running Summarize Node...");
  const lastMessage = state.messages[state.messages.length - 1];
  const summaryPrompt = [
    new SystemMessage("Summarize the response briefly in bullet points."),
    new HumanMessage(lastMessage.content),
  ];

  const summaryResponse = await model.invoke(summaryPrompt);
  return {
    summary: summaryResponse.content,
  };
}

// 4. Construct Graph
const workflow = new StateGraph(GraphAnnotation)
  .addNode("llm_agent", callLlmNode)
  .addNode("summarizer", summarizeNode)
  .addEdge(START, "llm_agent")
  .addEdge("llm_agent", "summarizer")
  .addEdge("summarizer", END);

// 5. Compile Graph
const app = workflow.compile();

// 6. Run Graph
async function main() {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    console.warn("⚠️  Please set a valid OPENROUTER_API_KEY in .env before running this script.");
    return;
  }

  console.log("🚀 Invoking LLM Graph...\n");
  const result = await app.invoke({
    messages: [new HumanMessage("Explain what LangGraph is in 2 concise sentences.")],
  });

  console.log("\n--- Full Conversation ---");
  result.messages.forEach((msg) => {
    console.log(`[${msg._getType()}]: ${msg.content}\n`);
  });

  console.log("--- Summary Output ---");
  console.log(result.summary);
}

main().catch(console.error);
