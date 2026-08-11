import type { Response } from "express";
import { indexDocument } from "../pipelines/index.pipeline.js";
import { extractTextFromFile } from "../services/file.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    console.log("Incoming upload request...");
    try {
        const { text, userId, source, scope = "individual" } = req.body;
        
        const activeUserId = req.user?.userId || userId || "demo_guest_user";
        const activeOrgId = req.user?.organizationId || null;

        // Demo Sandbox Guardrail: Limit unauthenticated demo users to 1 document upload
        const isDemo = !req.user || activeUserId.startsWith("demo_guest_");
        if (isDemo) {
            const countResult = await pool.query(
                "SELECT COUNT(DISTINCT source)::int as count FROM documents WHERE user_id = $1",
                [activeUserId]
            );
            const docCount = countResult.rows[0]?.count || 0;
            if (docCount >= 1) {
                return res.status(403).json({
                    message: "Demo Sandbox is limited to 1 document upload. Please sign in or create an account for unlimited uploads.",
                    isDemoLimit: true,
                });
            }
        }

        let finalText = text;
        if (req.file) { 
            console.log("File received:", req.file.originalname);
            finalText = await extractTextFromFile(req.file);
            console.log("Extracted length:", finalText.length);
        }

        const docSource = source || (req.file ? req.file.originalname : "unknown");

        if (!finalText || !activeUserId || !docSource) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const visibility = scope === "org" && activeOrgId ? "org" : "private";

        const result = await indexDocument(
            activeUserId,
            finalText,
            docSource,
            visibility,
            visibility === "org" ? activeOrgId : null
        );

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Upload error:", error.message || error);
        return res.status(500).json({ message: "Failed to upload document: " + (error.message || error) });
    }
};