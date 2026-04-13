import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload.route.js";
import askRoutes from "./routes/ask.route.js";
const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://rag-platform-blond.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api", uploadRoutes);
app.use("/api", askRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API running 🚀");
});


export default app;