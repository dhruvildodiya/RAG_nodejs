import { splitText } from "../services/chunking.service.js";
import { getEmbedding } from "../services/embedding.service.js";
import pool from "../config/db.js";

export const indexDocument = async (rawText) => {
  const chunks = await splitText(rawText);

  for (const chunk of chunks) {
    const text = chunk.pageContent;

    const embedding = await getEmbedding(text);

    await pool.query(
      `INSERT INTO documents (content, embedding)
       VALUES ($1, $2)`,
      [text, JSON.stringify(embedding)]
    );
  }
};