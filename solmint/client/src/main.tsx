// ─── Polyfills MUST be first ─────────────────────────────────────────────────
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
(window as any).Buffer = Buffer;
(window as any).global = window;
// ─────────────────────────────────────────────────────────────────────────────
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
