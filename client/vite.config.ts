import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["@mui/material", "@mui/system", "@emotion/react", "@emotion/styled"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3002", changeOrigin: true },
      "/ws": { target: "ws://localhost:3002", ws: true },
    },
  },
});
