import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.");
}

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
