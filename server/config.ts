import { z } from "zod";

// Server environment configuration schema
const serverConfigSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Server settings (optional with defaults)
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  // Phase 2: Supabase Auth (optional until Phase 2B)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Phase 2C: Billing (optional until Phase 2C)
  REVENUECAT_API_KEY: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Observability (optional but recommended)
  SENTRY_DSN: z.string().optional(),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

// Validate and export config - fails fast if required vars missing
function loadConfig(): ServerConfig {
  const result = serverConfigSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Server configuration error:\n${errors}`);
  }

  return result.data;
}

export const config = loadConfig();

// Helper to check if we're in production
export const isProduction = config.NODE_ENV === "production";

// Helper to check if Supabase is configured (Phase 2B)
export const hasSupabase = Boolean(
  config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to check if billing is configured (Phase 2C)
export const hasBilling = Boolean(
  config.REVENUECAT_API_KEY || config.STRIPE_SECRET_KEY
);
