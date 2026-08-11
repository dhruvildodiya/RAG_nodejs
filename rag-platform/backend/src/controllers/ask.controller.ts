import type { Response } from "express";
import askQuestion from "../pipelines/rag.pipeline.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";

const demoQuestionCounts = new Map<string, number>();

export const askController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { question, userId, conversationId: reqConvId, scope = "individual" } = req.body;

        const activeUserId = req.user?.userId || userId || "demo_guest_user";
        const activeOrgId = req.user?.organizationId || null;

        // Demo Sandbox Guardrail: Limit unauthenticated demo users to 3 questions
        const isDemo = !req.user || activeUserId.startsWith("demo_guest_");
        if (isDemo) {
            const currentCount = demoQuestionCounts.get(activeUserId) || 0;
            if (currentCount >= 3) {
                return res.status(403).json({
                    error: "Demo Sandbox question limit reached (3/3 questions asked). Please sign in to ask unlimited questions.",
                    isDemoLimit: true,
                });
            }
            demoQuestionCounts.set(activeUserId, currentCount + 1);
        }

        if (!question || !activeUserId) {
            return res.status(400).json({
                error: "question and userId are required",
            });
        }

        let conversationId = reqConvId;

        // 1. Check or create conversation thread
        if (conversationId) {
            const checkRes = await pool.query(`SELECT id FROM conversations WHERE id = $1`, [conversationId]);
            if (checkRes.rows.length === 0) {
                conversationId = null;
            }
        }

        if (!conversationId) {
            conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const title = question.length > 45 ? `${question.slice(0, 42)}...` : question;
            const visibility = scope === "org" && activeOrgId ? "org" : "individual";

            await pool.query(
                `INSERT INTO conversations (id, user_id, scope, organization_id, title)
                 VALUES ($1, $2, $3, $4, $5)`,
                [conversationId, activeUserId, visibility, visibility === "org" ? activeOrgId : null, title]
            );
        } else {
            // Update conversation updated_at timestamp
            await pool.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
        }

        // 2. Insert User Question Message
        const userMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await pool.query(
            `INSERT INTO messages (id, conversation_id, role, content)
             VALUES ($1, $2, 'user', $3)`,
            [userMsgId, conversationId, question]
        );

        // 3. Execute RAG Retrieval & LLM Generation
        const result = await askQuestion(question, activeUserId, scope, activeOrgId);

        // 4. Insert Assistant Answer Message
        const botMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await pool.query(
            `INSERT INTO messages (id, conversation_id, role, content, sources)
             VALUES ($1, $2, 'assistant', $3, $4)`,
            [botMsgId, conversationId, result.answer, result.sources || []]
        );

        return res.json({
            ...result,
            conversationId,
        });
    } catch (error) {
        console.error("Ask error:", error);
        return res.status(500).json({ error: "Failed to answer question" });
    }
};