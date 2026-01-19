import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from './tamagui.config';
import { apiBaseUrl } from '@/lib/config';

// Stable side effect: forces config.ts into prod bundles
// Inspect in Safari devtools: __PPPAL__.apiBaseUrl
(globalThis as any).__PPPAL__ = (globalThis as any).__PPPAL__ || {};
(globalThis as any).__PPPAL__.apiBaseUrl = apiBaseUrl;

if (import.meta.env.DEV) {
  console.log('[API Base URL]', apiBaseUrl || '(relative)');
}

createRoot(document.getElementById("root")!).render(
  <TamaguiProvider config={tamaguiConfig}>
    <App />
  </TamaguiProvider>
);
