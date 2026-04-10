import  {splitText} from "../services/chunk.service.js";
import { getEmbedding } from "../services/embedding.service.js";
import  pool  from "../config/db.js";


export const indexDocument = async (
    userId: string,
    text: string,
    source: string
) => {
    try {
        console.log(`Starting indexing for user: ${userId}, source: ${source}`);
        
        const chunks = await splitText(text);
        console.log(`Docs Chunked: ${chunks.length} chunks generated.`);

        //loop through chunks
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const content = chunk!.pageContent;

            console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

            //generate embedding
            const embedding = await getEmbedding(content);
            console.log(`Embedding Generated for chunk ${i + 1} (length: ${embedding.length})`);

            //store in db
            await pool.query(
                `INSERT INTO documents (user_id, content, embedding, source)
             VALUES ($1, $2, $3, $4)`,
                [userId, content, JSON.stringify(embedding), source]
            );
            console.log(`Stored chunk ${i + 1} in database.`);
        }

        console.log("Indexing completed successfully.");
        return {
            success: true,
            message: "Document indexed successfully",
            chunks: chunks.length,
        };

    } catch (error: any) {
        console.error("Indexing error details:", error.message || error);
        throw error; // Re-throw to be caught by the route handler
    }
};