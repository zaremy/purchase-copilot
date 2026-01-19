/**
 * Sentry client initialization for React 19
 * Must be imported and called first in main.tsx
 */
import * as Sentry from "@sentry/react";
import { scrubObjectPII } from "@shared/sentry-pii";

let initialized = false;

/**
 * Initialize Sentry for client-side error tracking
 * No-op if VITE_SENTRY_DSN is not set
 */
export function initSentry(): void {
  if (initialized) return;
  if (!import.meta.env.VITE_SENTRY_DSN) {
    if (import.meta.env.DEV) {
      console.log("[Sentry] Skipped - VITE_SENTRY_DSN not set");
    }
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,

    // Lower sample rate in production to reduce costs
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Scrub PII from all events before sending
    beforeSend(event) {
      return scrubObjectPII(event);
    },

    // Don't send events in development unless explicitly enabled
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_DEBUG === "true",
  });

  initialized = true;

  if (import.meta.env.DEV) {
    console.log("[Sentry] Initialized");
  }
}

/**
 * React 19 error handler factory
 * Use with createRoot options: onUncaughtError, onCaughtError, onRecoverableError
 */
export const sentryReactErrorHandler = Sentry.reactErrorHandler;

/**
 * Re-export Sentry for manual error capture
 */
export { Sentry };
