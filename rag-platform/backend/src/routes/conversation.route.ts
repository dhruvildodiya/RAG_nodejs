import { Router } from "express";
import {
  getConversations,
  getConversationMessages,
  deleteConversation,
} from "../controllers/conversation.controller.js";
import { optionalAuthenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalAuthenticateJWT, getConversations);
router.get("/:id/messages", optionalAuthenticateJWT, getConversationMessages);
router.delete("/:id", optionalAuthenticateJWT, deleteConversation);

export default router;
