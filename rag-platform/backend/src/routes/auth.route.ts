import { Router } from "express";
import { register, login, getMe, createOrg, getMembers, inviteMember, joinOrg } from "../controllers/auth.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJWT, getMe);
router.post("/organization", authenticateJWT, createOrg);
router.get("/organization/members", authenticateJWT, getMembers);
router.post("/organization/invite", authenticateJWT, inviteMember);
router.post("/organization/join", authenticateJWT, joinOrg);

export default router;
