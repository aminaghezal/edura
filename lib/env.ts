/**
 * EDURA — Environment validation
 *
 * Fails the build / startup if a required env var is missing.
 * Imported once from anywhere in the app.
 */

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  // Cron — required in production, optional in dev
  CRON_SECRET: z.string().optional(),

  // AI — optional (deterministic fallback if absent)
  ANTHROPIC_API_KEY: z.string().optional(),

  // Node
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Missing or invalid environment variables. See .env.example");
}

if (parsed.data.NODE_ENV === "production" && !parsed.data.CRON_SECRET) {
  console.error("❌ CRON_SECRET is required in production");
  throw new Error("CRON_SECRET is required in production");
}

export const env = parsed.data;
