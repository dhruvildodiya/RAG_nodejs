 import express from "express";
import dotenv from "dotenv";
import { indexDocs } from "./rag/indexDocs.js";
import { retrieveDocs } from "./rag/retrieve.js";
import { generateAnswer } from "./rag/generate.js";

dotenv.config();

const app = express();
app.use(express.json());

 await indexDocs(); // Run manually: node rag/indexDocs.js
app.get("/ask")
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  const docs = await retrieveDocs(question);
  const answer = await generateAnswer(question, docs);

  res.json({
    answer,
    
  });
});

app.listen(3000, () => {
  console.log("RAG server running");
});

