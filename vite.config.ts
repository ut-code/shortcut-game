import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [sveltekit()],
  build: {
    target: ["es2022", "edge89", "firefox89", "chrome89", "safari15"],
  },
  server: {
    port: 8080,
    open: true,
  },
});
