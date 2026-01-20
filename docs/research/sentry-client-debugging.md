# Sentry Client-Side Error Tracking: Debug Research

**Date:** 2026-01-18
**Issue:** Sentry not capturing `throw new Error('test')` from browser DevTools console

---

## Root Cause

**The test method was invalid, not the Sentry integration.**

### DevTools Console Errors Are Sandboxed

Browser DevTools console runs in a **sandboxed environment** isolated from the page's JavaScript context. Errors thrown there do NOT propagate through `window.onerror` that Sentry hooks into.

**Source:** [Sentry GitHub Issue #3378](https://github.com/getsentry/sentry-javascript/issues/3378)

> "Uncaught exceptions thrown in web browser developer console aren't captured"

This is expected browser security behavior, not a bug.

### React 19 Error Handlers Only Catch Render Errors

The `onUncaughtError`, `onCaughtError`, `onRecoverableError` hooks in `createRoot()` only catch errors during React's rendering lifecycle.

**They do NOT catch:**
- Errors in event handlers (unless they crash the render)
- Errors in setTimeout/setInterval callbacks
- Promise rejections (unless re-thrown into React)
- Errors from DevTools console

**Source:** [React Error Boundaries docs](https://legacy.reactjs.org/docs/error-boundaries.html)

---

## Sentry Error Capture Matrix

| Error Type | Captured Automatically? | Manual Capture Required? |
|------------|------------------------|-------------------------|
| Uncaught exceptions (in app code) | Yes | No |
| Unhandled Promise rejections | Yes | No |
| Caught exceptions (try-catch) | No | Yes |
| DevTools console errors | **No** | N/A (cannot capture) |
| `console.error()` calls | No | Requires `captureConsoleIntegration` |
| Event handler errors | Depends | Yes for non-render crashes |

---

## Correct Testing Methods

### Method 1: Manual Capture Helper

Add to `sentry.ts`:
```typescript
if (import.meta.env.PROD) {
  (window as any).__testSentry = () => {
    Sentry.captureException(new Error("Manual Sentry test"));
    console.log("[Sentry] Test event sent");
  };
}
```

Then in console: `__testSentry()`

### Method 2: Render Error (Tests React Integration)

```tsx
function SentryTestError() {
  const [shouldError, setShouldError] = useState(false);
  if (shouldError) throw new Error("Sentry test during render");
  return <button onClick={() => setShouldError(true)}>Test</button>;
}
```

### Method 3: Inline Script (Tests Global Handler)

```html
<script>myUndefinedFunction();</script>
```

---

## Vite + Vercel Environment Variables

### The Problem

Vite's `loadEnv()` reads from `.env` files, not from `process.env`. Vercel injects environment variables into `process.env`, not into `.env` files.

### The Fix

In `script/build.ts`:
```typescript
const env = loadEnv("production", process.cwd(), "VITE_");
// Also include VITE_ vars from process.env (Vercel injects these)
for (const key of Object.keys(process.env)) {
  if (key.startsWith("VITE_") && !env[key]) {
    env[key] = process.env[key]!;
  }
}
Object.assign(process.env, env);
```

### Alternative: Build Script

Create `vercel.sh`:
```bash
#!/bin/bash
echo "VITE_SENTRY_DSN=$VITE_SENTRY_DSN" >> .env
npm run build
```

Set Vercel build command to `sh vercel.sh`.

---

## Verification Steps

### 1. Check if Sentry SDK is loaded
```javascript
console.log(window.__SENTRY__);
```

### 2. Check if DSN was baked in
Search built JS bundle for `sentry.io` or `ingest.us.sentry.io`

### 3. Check initialization status
```javascript
console.log(Sentry?.isInitialized?.());
```

### 4. Enable debug mode (dev only)
```typescript
Sentry.init({
  debug: true,
  // ...
});
```

---

## Key Integrations

### `globalHandlersIntegration` (enabled by default)

Captures:
- `window.onerror` - uncaught exceptions
- `window.onunhandledrejection` - unhandled promises

### `captureConsoleIntegration` (optional)

Captures `console.error()` calls as Sentry events:
```typescript
Sentry.init({
  integrations: [
    Sentry.captureConsoleIntegration({ levels: ['error'] }),
  ],
});
```

---

## Sources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [React 19 Support - Sentry Changelog](https://sentry.io/changelog/react-19-support/)
- [GlobalHandlers Integration](https://docs.sentry.io/platforms/javascript/configuration/integrations/globalhandlers/)
- [Sentry JavaScript Troubleshooting](https://docs.sentry.io/platforms/javascript/troubleshooting/)
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode)
- [Vercel + Vite Env Vars Discussion](https://github.com/vercel/vercel/discussions/6406)

---

## Sentry Serverless Debugging (2026-01-18)

### Problem

Server-side Sentry errors not appearing despite:
- `SENTRY_DSN` set in Vercel environment variables
- `Sentry.setupExpressErrorHandler(app)` configured
- `/api/debug/sentry` endpoint returns error response
- `waitUntil(flushSentry(2000))` implemented

### Investigation Results

**Verified working:**
1. ✅ Client bundle has Sentry DSN baked in
2. ✅ Server bundle reads `SENTRY_DSN` from `process.env` at runtime
3. ✅ Vercel env vars set for all environments
4. ✅ `waitUntil` properly wrapping `flushSentry`

**Unknown:**
1. ❓ Is Sentry actually initializing at runtime? (no log visibility)
2. ❓ Is `setupExpressErrorHandler` capturing errors?
3. ❓ Is the flush completing before function terminates?

### Vercel Serverless Lifecycle

**Key insight:** Vercel terminates serverless functions immediately after the response is sent. From [Vercel docs](https://vercel.com/docs/fluid-compute):
> "Background processing: After fulfilling user requests, you can continue executing background tasks using `waitUntil`."

**Correct pattern:**
```typescript
import { waitUntil } from '@vercel/functions';

res.on("finish", () => {
  waitUntil(flushSentry(2000));  // Vercel waits for this promise
});
```

### Diagnostic Recommendations

From external analysis (ChatGPT):

1. **Install Vercel Sentry Integration** — Easiest path, handles runtime wiring automatically
   - URL: https://vercel.com/marketplace/sentry

2. **Use explicit `captureException`** — Don't rely solely on `setupExpressErrorHandler`

3. **Add diagnostics to debug endpoint**:
```typescript
app.get("/api/debug/sentry", async (req, res) => {
  const error = new Error("Sentry test error");
  Sentry.captureException(error);
  res.status(500).json({
    message: error.message,
    sentryDsnSet: !!process.env.SENTRY_DSN,
    sentryDsnPrefix: process.env.SENTRY_DSN?.substring(0, 20) || "NOT_SET",
  });
});
```

4. **Symptom-to-cause map**:
   - No events anywhere → init not running / DSN missing / blocked network
   - Events in web, none in server → Server SDK not shipping/running
   - Events but minified stacks → sourcemaps/release pipeline broken

### Next Steps

1. Modify `/api/debug/sentry` to use explicit `captureException` + return diagnostics
2. If still fails: Install Vercel Sentry Integration
3. If still fails: Check Sentry project settings for filters/quotas
