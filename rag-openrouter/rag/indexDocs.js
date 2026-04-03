import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { insertVector } from "./vectorStore.js";
import { getEmbedding } from "./embed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function indexDocs() {
  const docsPath = path.join(__dirname, "..", "src", "data", "docs.txt");
  const text = fs.readFileSync(docsPath, "utf-8");

  const chunks = text.split("\n").filter(chunk => chunk.trim().length > 0);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i]);

    insertVector(`doc-${i}`, embedding, chunks[i]);
  }

  console.log(`Indexed ${chunks.length} doc chunks`);
}

