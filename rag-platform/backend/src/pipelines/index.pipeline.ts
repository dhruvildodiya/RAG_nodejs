import { splitText } from "../services/chunk.service.js";
import { getEmbedding } from "../services/embedding.service.js";
import pool from "../config/db.js";


export const indexDocument = async (
    userId: string,
    text: string,
    source: string
) => {
    try {
        console.log(`Starting indexing for user: ${userId}, source: ${source}`);

        const chunks = await splitText(text);
        console.log(`Docs Chunked: ${chunks.length} chunks generated.`);

      
        const contents = chunks.map((chunk) => chunk!.pageContent)
        console.log("Contents:", contents);
        const embeddings = await getEmbedding(contents)

        const userIds = contents.map(() => userId);
        const sources = contents.map(() => source);

        // Convert embeddings to proper vector format for PostgreSQL
        const embeddingVectors = embeddings.map(embedding => `[${embedding.join(',')}]`);
        
        await pool.query(
            `
  INSERT INTO documents (user_id, content, embedding, source)
  SELECT * FROM UNNEST ($1::text[], $2::text[], $3::vector[], $4::text[])
  `,
            [userIds, contents, embeddingVectors, sources]
        );

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