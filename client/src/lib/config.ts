// Client configuration
// Note: Only PUBLIC keys should be exposed here - never service role keys

// Phase 2B: Supabase Auth (uncomment when ready)
// export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// API base URL - relative in production, explicit in dev
export const apiBaseUrl = import.meta.env.VITE_API_URL || "";

// Feature flags for gradual rollout
export const features = {
  // Phase 2B: Enable when Supabase Auth is ready
  auth: false,
  // Phase 2C: Enable when RevenueCat is integrated
  billing: false,
  // Phase 3: Enable when AI features are ready
  aiGuidance: false,
} as const;

// Environment checks
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
