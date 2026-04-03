import { getEmbedding } from "./embed.js";
import { search } from "./vectorStore.js";

export async function retrieveDocs(question) {
  const queryVector = await getEmbedding(question);

  const result = search(queryVector, 4);
  return result;
}
