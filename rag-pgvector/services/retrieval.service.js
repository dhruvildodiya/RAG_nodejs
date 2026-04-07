import  pool  from "../config/db.js";
import { getEmbedding } from "./embed.js";

export const retrieveContext = async (query, k = 5) => {
  const embedding = await getEmbedding(query);

  const result = await pool.query(
    `SELECT content
     FROM documents
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [JSON.stringify(embedding), k]
  );

  return result.rows.map(r => r.content);
};