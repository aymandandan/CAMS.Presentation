import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    // Optional: proxy API requests to .NET backend during development
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "https://localhost:5001", // your .NET backend URL
        changeOrigin: true,
        secure: false, // if using self-signed cert
      },
    },
  },
  build: {
    sourcemap: true, // recommended for debugging
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          ) {
            return "vendor";
          }
          if (
            id.includes("@mui/material") ||
            id.includes("@mui/icons-material")
          ) {
            return "mui";
          }
          if (id.includes("@tanstack/react-query")) {
            return "query";
          }
        },
      },
    },
  },
});
