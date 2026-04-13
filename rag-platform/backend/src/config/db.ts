import pkg from "pg";
const { Pool } = pkg;
import { env } from "./env.js";


export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

pool.on("connect", () => {
  console.log("Connected to the database ✅");
});

pool.on("error", (err: Error) => {
  console.error("Database connection error ❌", err);
});

export default pool;
