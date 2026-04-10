import { retrieveRelatedChunks } from "../services/retrieval.service.js";
import { generateAnswer } from "../services/llm.service.js";
import { simpleRerank } from "../utils/rerank.util.js";
const askQuestion = async(
      question: string,
  userId: string
)=>{
    //retrieve related chunks
    const chunks = await retrieveRelatedChunks(question, userId);
    
    //rerank chunks
    const rerankedChunks = simpleRerank(question, chunks.map(c => c.content))
    
    //create context
    const context = rerankedChunks.slice(0, 5).join("\n")

    //generate answer
    const answer = await generateAnswer(question, context)

    // Extract unique sources
    const uniqueSources = Array.from(
        new Set(chunks.map((c: any) => c.source).filter(Boolean))
    );

    return { answer, sources: uniqueSources }
}

export default askQuestion