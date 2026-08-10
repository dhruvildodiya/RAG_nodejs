import { Router } from "express";
import { getDocuments, deleteDocument } from "../controllers/documents.controller.js";

const router = Router();

router.get("/documents", getDocuments);
router.delete("/documents", deleteDocument);

export default router;
