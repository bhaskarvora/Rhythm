// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Frontend will call /api/... and Vite will forward it to your backend
      "/api": {
        target: "http://localhost:8000", // <-- change to your backend during DEV
        changeOrigin: true,
      },
    },
  },
});
