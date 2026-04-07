import express from "express";
import ragRoutes from "./routes/rag.routes.js";

const app = express();

app.use(express.json());
app.use("/rag", ragRoutes);

export default app;