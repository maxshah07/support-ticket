import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Browser requests /api on Vite; Vite forwards it to Laravel.
    // This avoids cross-origin configuration during local practice.
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
