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

  // Phase 3E: Billing/Entitlements
  REVENUECAT_API_KEY: z.string().optional(),
  REVENUECAT_WEBHOOK_AUTH_TOKEN: z.string().optional(), // Bearer token for webhook verification
  ADMIN_SERVICE_KEY: z.string().optional(), // Service key for admin endpoints
  ADMIN_ENDPOINTS_ENABLED: z.enum(["true", "false"]).optional().default("false"), // Disabled in prod by default

  // Observability (optional but recommended)
  SENTRY_DSN: z.string().optional(),
  SENTRY_RELEASE: z.string().optional(),
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

// Helper to check if billing is configured (Phase 3E)
export const hasBilling = Boolean(config.REVENUECAT_API_KEY);

// Helper to check if Sentry is configured
export const hasSentry = Boolean(config.SENTRY_DSN);

// Helper to check if admin endpoints are enabled
export const adminEndpointsEnabled = config.ADMIN_ENDPOINTS_ENABLED === "true";

// Helper to check if billing webhook is configured
export const hasWebhookAuth = Boolean(config.REVENUECAT_WEBHOOK_AUTH_TOKEN);
