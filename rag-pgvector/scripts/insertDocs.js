import  pool  from "../config/db.js";
import { getEmbedding } from "../services/embed.js";


const docs = ["Node.js is a JavaScript runtime",
    "PostgreSQL is a relational database",
    "pgvector enables vector similarity search",
    "RAG combines retrieval and generation",
    "Embeddings capture semantic meaning",
    "Vector search finds similar items",
    "LLMs generate human-like text",
    "Vector databases store embeddings",
    "Similarity search uses cosine similarity",
    "RAG improves AI response quality"]

const main = async () => {
    try {
        for (const doc of docs) {
            const embedding = await getEmbedding(doc);
            await pool.query("INSERT INTO documents (content, embedding) VALUES ($1, $2)", [doc, JSON.stringify(embedding)]);
        }
        console.log("Documents inserted successfully");
    } catch (error) {
        console.log(error);
    }
    process.exit(0);
}

main();