import type { Response } from "express";
import pool from "../config/db.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const getDocuments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.userId || (req.query.userId as string) || "user1";
        const scope = (req.query.scope as string) || "individual";
        const orgId = req.user?.organizationId || null;

        const isOrgMode = scope === "org" && Boolean(orgId);

        const sqlQuery = isOrgMode
            ? `SELECT 
                    source,
                    COUNT(*)::int as "chunkCount",
                    MAX(id) as max_id,
                    SUM(LENGTH(content))::int as total_length,
                    visibility
                 FROM documents
                 WHERE organization_id = $1 AND visibility = 'org'
                 GROUP BY source, visibility
                 ORDER BY MAX(id) DESC`
            : `SELECT 
                    source,
                    COUNT(*)::int as "chunkCount",
                    MAX(id) as max_id,
                    SUM(LENGTH(content))::int as total_length,
                    visibility
                 FROM documents
                 WHERE user_id = $1 AND (visibility = 'private' OR visibility IS NULL)
                 GROUP BY source, visibility
                 ORDER BY MAX(id) DESC`;

        const targetId = isOrgMode ? orgId : userId;
        const result = await pool.query(sqlQuery, [targetId]);

        const documents = result.rows.map((row) => ({
            id: `source-${row.source}`,
            name: row.source,
            type: row.source.split(".").pop() || "doc",
            size: `${(row.total_length / 1024).toFixed(1)} KB`,
            timestamp: "Indexed in DB",
            chunkCount: row.chunkCount,
            visibility: row.visibility || "private",
        }));

        return res.status(200).json(documents);
    } catch (error: any) {
        console.error("Get documents error:", error.message || error);
        return res.status(500).json({ message: "Failed to fetch documents" });
    }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { source, userId, scope = "individual" } = req.body;
        const activeUserId = req.user?.userId || userId;
        const orgId = req.user?.organizationId || null;

        if (!source || !activeUserId) {
            return res.status(400).json({ message: "source is required" });
        }

        const isOrgMode = scope === "org" && Boolean(orgId);

        if (isOrgMode) {
            await pool.query(
                `DELETE FROM documents WHERE organization_id = $1 AND source = $2 AND visibility = 'org'`,
                [orgId, source]
            );
        } else {
            await pool.query(
                `DELETE FROM documents WHERE user_id = $1 AND source = $2 AND (visibility = 'private' OR visibility IS NULL)`,
                [activeUserId, source]
            );
        }

        return res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error: any) {
        console.error("Delete document error:", error.message || error);
        return res.status(500).json({ message: "Failed to delete document" });
    }
};
