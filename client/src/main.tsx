// CRITICAL: Sentry must be initialized before any other imports
import { initSentry, sentryReactErrorHandler } from "@/lib/sentry";
initSentry();

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TamaguiProvider } from "tamagui";
import tamaguiConfig from "./tamagui.config";
import { apiBaseUrl } from "@/lib/config";

// Stable side effect: forces config.ts into prod bundles
// Inspect in Safari devtools: __PPPAL__.apiBaseUrl
(globalThis as any).__PPPAL__ = (globalThis as any).__PPPAL__ || {};
(globalThis as any).__PPPAL__.apiBaseUrl = apiBaseUrl;

if (import.meta.env.DEV) {
  console.log("[API Base URL]", apiBaseUrl || "(relative)");
}

// React 19 error handlers - send errors to Sentry
createRoot(document.getElementById("root")!, {
  onUncaughtError: sentryReactErrorHandler(),
  onCaughtError: sentryReactErrorHandler(),
  onRecoverableError: sentryReactErrorHandler(),
}).render(
  <TamaguiProvider config={tamaguiConfig}>
    <App />
  </TamaguiProvider>
);
