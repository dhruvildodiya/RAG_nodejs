import express from 'express';
import dotenv from "dotenv";
import { initVectorStore } from "./rag/vectorStore.js";
import { createQAChain } from "./rag/chain.js";

dotenv.config();

const app = express();
app.use(express.json());

let chain;

(async() =>{
    await initVectorStore();
    chain = createQAChain();
})()

app.post('/ask', async (req, res) => {
try {
    const { question } = req.body;
    if (!chain) {
        return res.status(503).json({ error: 'Chain not initialized yet. Please try again later.' });
    }
   const handler = {
      handleRetrieverEnd(docs) {
        console.log("📄 Retrieved docs:", docs.map(d => d.pageContent));
      },
      handleLLMStart(_, prompts) {
        console.log("🧠 Prompt:", prompts);
      },
      handleLLMEnd(output) {
        console.log("✅ Response:", output);
      }
    };

    const response = await chain.invoke(
        {question : question},
        {callbacks : [handler]}
    )

    res.json({
        answer : response
    })
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
}
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

