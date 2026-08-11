import "./polyfills.js";
import app from "./app.js";
import pool from "./config/db.js";
import { env } from "./config/env.js";
import { initDb } from "./config/initDb.js";

const PORT = env.PORT || 5001;
const HOST = "0.0.0.0"; // Listen on all interfaces

const SERVER_URL = env.SERVER_URL || `http://localhost:${PORT}`;

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on : ${SERVER_URL}`);
});
const dbConnect = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected ✅");
    client.release();
    await initDb();
  } catch (error) {
    console.error("Database connection error ❌", error);
  }
};

dbConnect();
