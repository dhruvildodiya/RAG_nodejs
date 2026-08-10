import { retrieveRelatedChunks } from "../services/retrieval.service.js";
import { generateAnswer } from "../services/llm.service.js";
import { simpleRerank } from "../utils/rerank.util.js";

const isGreeting = (text: string): boolean => {
  const cleanText = text.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const greetings = [
    "hi", "hello", "hey", "heyy", "heyyy", "good morning", 
    "good afternoon", "good evening", "howdy", "sup", "whatsup", "whats up" , "hii"
  ];
  return greetings.includes(cleanText);
};

const askQuestion = async (
  question: string,
  userId: string
) => {
  // Check if user is sending a basic greeting
  if (isGreeting(question)) {
    const answer = await generateAnswer(question, "");
    return { answer, sources: [] };
  }

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

  // 3. Filter chunks with a minimum similarity threshold or top match
  // Only include chunks with similarity score > 0.35 or the best single match if relevant
  const relevantChunks = rerankedChunks.filter((c) => c.score >= 0.35);
  const topChunk = rerankedChunks[0];
  const chunksToUse = relevantChunks.length > 0 
    ? relevantChunks.slice(0, 3) 
    : (topChunk && topChunk.score >= 0.25 ? [topChunk] : []);

  const context = chunksToUse.map((c) => c.content).join("\n\n");

  // 4. Generate answer using LLM
  const answer = await generateAnswer(question, context);

  // 5. Extract unique sources ONLY from the chunks actually passed to context
  const uniqueSources = Array.from(
    new Set(chunksToUse.map((c) => c.source).filter(Boolean))
  );

  return { answer, sources: uniqueSources };
};

export default askQuestion;