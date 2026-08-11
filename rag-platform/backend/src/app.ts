import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload.route.js";
import askRoutes from "./routes/ask.route.js";
import documentRoutes from "./routes/documents.route.js";
import authRoutes from "./routes/auth.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import { optionalAuthenticateJWT } from "./middleware/auth.middleware.js";

const app = express();

app.use(cors({
  origin: [
     "http://localhost:3000", 
    "https://rag-nodejs.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api", optionalAuthenticateJWT, uploadRoutes);
app.use("/api", optionalAuthenticateJWT, askRoutes);
app.use("/api", optionalAuthenticateJWT, documentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API running 🚀");
});


export default app;