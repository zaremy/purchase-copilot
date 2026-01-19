/**
 * Sentry server instrumentation
 * MUST be imported first in server/index.ts before any other imports
 */
import * as Sentry from "@sentry/node";
import { scrubObjectPII } from "../shared/sentry-pii";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE,

    // Lower sample rate in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Scrub PII from all events before sending
    beforeSend(event) {
      return scrubObjectPII(event);
    },
  });

  console.log("[Sentry] Server instrumentation initialized");
} else if (process.env.NODE_ENV !== "production") {
  console.log("[Sentry] Skipped - SENTRY_DSN not set");
}

export { Sentry };
