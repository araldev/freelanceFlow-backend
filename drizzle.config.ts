import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv'

dotenv.config();

export default defineConfig({
  schema: "./src/config/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", 
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    token: process.env.TURSO_AUTH_TOKEN!,
  },
});