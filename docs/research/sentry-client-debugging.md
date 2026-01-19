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
