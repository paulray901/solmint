// Buffer polyfill injected into all Vite-optimized deps
import { Buffer } from "buffer";
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;
(globalThis as any).global = globalThis;
