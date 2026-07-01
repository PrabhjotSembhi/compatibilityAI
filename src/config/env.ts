import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  AI_RATE_LIMIT_REQUESTS: z.coerce.number().int().min(1).default(20),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60000),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

let cachedEnv: z.infer<typeof envSchema> | undefined;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}
