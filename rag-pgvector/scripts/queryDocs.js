import pool from "../config/db.js";
import { getEmbedding } from "../services/embed.js";

const query = async () => {
    const userQuery = "What is pgvector?";

    const embedding = await getEmbedding(userQuery);

    const result = await pool.query(
        `SELECT content,
            embedding <=> $1 AS distance
     FROM documents
     ORDER BY embedding <=> $1
     LIMIT 3`,
        [JSON.stringify(embedding)]
    );

    console.log("\nTop Results:\n");
    console.table(result.rows);

    process.exit();
};

query();