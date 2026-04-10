import type { Request, Response } from "express";
import { indexDocument } from "../pipelines/index.pipeline.js";
import { extractTextFromFile } from "../services/file.service.js";
export const uploadDocument = async (req: Request, res: Response) => {
    console.log("Incoming upload request...");
    try {
        const { text, userId, source } = req.body;
        let finalText = text;
        if (req.file) { 
            
            console.log("File received:", req.file.originalname);

            finalText = await extractTextFromFile(req.file);

            console.log("Extracted length:", finalText.length);
        }
        if (!finalText || !userId || !source) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await indexDocument(userId, finalText, source || "unknown");
        return res.status(200).json(result);
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Failed to upload document" });
    }
}