import { retrieveRelatedChunks } from "../services/retrieval.service.js";
import { generateAnswer } from "../services/llm.service.js";
import { simpleRerank } from "../utils/rerank.util.js";

const askQuestion = async (
  question: string,
  userId: string
) => {
  // 1. Retrieve related chunks from vector DB
  const chunks = await retrieveRelatedChunks(question, userId);

  if (!chunks || chunks.length === 0) {
    return {
      answer: "No relevant documents found. Please upload a document first.",
      sources: [],
    };
  }

  // 2. Rerank chunks while keeping metadata
  const rerankedChunks = simpleRerank(question, chunks);

  // 3. Select top 5 chunks for context
  const topChunks = rerankedChunks.slice(0, 5);
  const context = topChunks.map((c) => c.content).join("\n\n");

  // 4. Generate answer using LLM
  const answer = await generateAnswer(question, context);

  // 5. Extract unique sources from the actual chunks used in context
  const uniqueSources = Array.from(
    new Set(topChunks.map((c) => c.source).filter(Boolean))
  );

  return { answer, sources: uniqueSources };
};

export default askQuestion;