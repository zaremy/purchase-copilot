import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from './tamagui.config';

createRoot(document.getElementById("root")!).render(
  <TamaguiProvider config={tamaguiConfig}>
    <App />
  </TamaguiProvider>
);
