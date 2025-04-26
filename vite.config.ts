import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: ["es2022", "edge89", "firefox89", "chrome89", "safari15"],
  },
  server: {
    port: 8080,
    open: true,
  },
});
