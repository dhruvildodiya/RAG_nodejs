import type { Response } from "express";
import pool from "../config/db.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

// Fetch list of past conversations
export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, scope = "individual" } = req.query;
    const activeUserId = req.user?.userId || (userId as string) || "demo_guest_user";
    const activeOrgId = req.user?.organizationId || null;

    let query: string;
    let params: any[];

    if (scope === "org" && activeOrgId) {
      query = `
        SELECT id, title, scope, created_at, updated_at
        FROM conversations
        WHERE organization_id = $1 AND scope = 'org'
        ORDER BY updated_at DESC
      `;
      params = [activeOrgId];
    } else {
      query = `
        SELECT id, title, scope, created_at, updated_at
        FROM conversations
        WHERE user_id = $1 AND scope = 'individual'
        ORDER BY updated_at DESC
      `;
      params = [activeUserId];
    }

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (error: any) {
    console.error("Failed to fetch conversations:", error);
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// Fetch messages for a specific conversation
export const getConversationMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, role, content, sources, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    return res.json(result.rows);
  } catch (error: any) {
    console.error("Failed to fetch messages:", error);
    return res.status(500).json({ message: "Failed to fetch conversation messages" });
  }
};

// Delete a conversation
export const deleteConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM conversations WHERE id = $1`, [id]);
    return res.json({ message: "Conversation deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete conversation:", error);
    return res.status(500).json({ message: "Failed to delete conversation" });
  }
};
