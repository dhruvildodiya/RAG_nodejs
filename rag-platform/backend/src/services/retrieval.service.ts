import pool from "../config/db.js";
import { getEmbedding } from "./embedding.service.js";


export const retrieveRelatedChunks = async (
    query: string,
    userId: string
) => {
try {
    // 1. Convert question to embedding
    const queryEmbeddings = await getEmbedding([query])
    const queryEmbedding = queryEmbeddings[0] // Extract single embedding
    
    if (!queryEmbedding) {
        throw new Error("Failed to generate query embedding");
    }

    // 2. Query database for similar embeddings
    const result = await pool.query(
        `SELECT content, source, 1 - (embedding <=> $1::vector) AS score
        FROM documents
        WHERE user_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT 10`,
        [`[${queryEmbedding.join(',')}]`, userId]
    );

    // 3. Return the most similar chunks
    return result.rows.map((row) => ({
        content: row.content,
        source: row.source,
        score: parseFloat(row.score),
    }));
} catch (error) {
    console.error("Retrieval error:", error);
    throw error;
}
}