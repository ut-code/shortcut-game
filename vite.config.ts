import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 8080,
    open: true,
  },
});
