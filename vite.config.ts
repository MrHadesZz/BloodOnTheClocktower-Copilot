import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const isolationHeaders = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

const z3EngineVersion = createHash("sha256")
  .update(readFileSync("public/z3/engine.js"))
  .digest("hex")
  .slice(0, 12);

export default defineConfig({
  plugins: [react()],
  define: { __Z3_ENGINE_VERSION__: JSON.stringify(z3EngineVersion) },
  server: { headers: isolationHeaders },
  preview: { headers: isolationHeaders },
});
