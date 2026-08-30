import { z } from "zod";

/**
 * Environment variable validation.
 * Phase 1 needs nothing secret; every variable is optional so `npm run dev`
 * works with no .env.local. Add required vars here as milestones need them.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  COMFYUI_URL: z.string().url().optional(),
  BFL_API_KEY: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),
  REPLICATE_API_TOKEN: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

function parse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    console.error(
      `❌ Invalid ${label} environment variables:`,
      result.error.flatten().fieldErrors,
    );
    throw new Error(`Invalid ${label} environment variables`);
  }
  return result.data;
}

/** Client-safe values only (NEXT_PUBLIC_*). Safe to import anywhere. */
export const clientEnv = parse(
  clientSchema,
  {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  "client",
);

/** Server-only values. Importing this from a client component is a bug. */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must not be called in the browser");
  }
  return parse(serverSchema, process.env, "server");
}
