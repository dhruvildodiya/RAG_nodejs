import type { Request, Response } from "express";
import askQuestion from "../pipelines/rag.pipeline.js";


export const askController = async (req: Request, res: Response) => {
    try {
        const { question, userId } = req.body
        if (!question || !userId) {
            return res.status(400).json({
                error: "question and userId are required",
            });
        }

        const result = await askQuestion(question, userId)

        res.json(result)
    } catch (error) {
        console.error("Ask error:", error);
        res.status(500).json({ error: "Failed to answer question" });
    }
}