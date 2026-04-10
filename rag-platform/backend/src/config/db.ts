import pkg from "pg";
const { Pool } = pkg;
import { env } from "./env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected to the database ✅");
});

pool.on("error", (err: Error) => {
  console.error("Database connection error ❌", err);
});

export default pool;
