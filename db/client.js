import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error("DB connection error:", err);
});

export const db = drizzle(client);
