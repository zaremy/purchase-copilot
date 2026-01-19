/**
 * Sentry initialization for Vercel serverless functions
 * Must be imported and called first in src/index.ts
 *
 * Key difference from server/instrument.ts:
 * - Serverless functions require explicit flush() before exit
 * - Uses middleware wrapper to ensure events are sent
 */
import * as Sentry from "@sentry/node";
import { scrubObjectPII } from "../shared/sentry-pii";

let initialized = false;

/**
 * Initialize Sentry for Vercel serverless environment
 */
export function initSentryServerless(): void {
  if (initialized) return;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("[Sentry] Skipped - SENTRY_DSN not set");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "production",
    release: process.env.SENTRY_RELEASE,

    // Lower sample rate in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Scrub PII from all events before sending
    beforeSend(event) {
      return scrubObjectPII(event);
    },
  });

  initialized = true;
  console.log("[Sentry] Serverless instrumentation initialized");
}

/**
 * Flush Sentry events before serverless function exits
 * MUST be called before function returns to ensure events are sent
 *
 * @param timeout - Max time to wait for flush (default 2000ms)
 */
export async function flushSentry(timeout = 2000): Promise<void> {
  if (!initialized) return;
  await Sentry.flush(timeout);
}

export { Sentry };
