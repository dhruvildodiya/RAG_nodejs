import type { Request, Response } from "express";
import pool from "../config/db.js";

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const userId = (req.query.userId as string) || "user1";

        const result = await pool.query(
            `SELECT 
                source,
                COUNT(*)::int as "chunkCount",
                MAX(id) as max_id,
                SUM(LENGTH(content))::int as total_length
             FROM documents
             WHERE user_id = $1
             GROUP BY source
             ORDER BY MAX(id) DESC`,
            [userId]
        );

        const documents = result.rows.map((row) => ({
            id: `source-${row.source}`,
            name: row.source,
            type: row.source.split(".").pop() || "doc",
            size: `${(row.total_length / 1024).toFixed(1)} KB`,
            timestamp: "Indexed in DB",
            chunkCount: row.chunkCount,
        }));

        return res.status(200).json(documents);
    } catch (error: any) {
        console.error("Get documents error:", error.message || error);
        return res.status(500).json({ message: "Failed to fetch documents" });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { source, userId } = req.body;
        if (!source || !userId) {
            return res.status(400).json({ message: "source and userId are required" });
        }

        await pool.query(
            `DELETE FROM documents WHERE user_id = $1 AND source = $2`,
            [userId, source]
        );

        return res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error: any) {
        console.error("Delete document error:", error.message || error);
        return res.status(500).json({ message: "Failed to delete document" });
    }
};
