// @ts-check
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: "index.html",
      assets: "dist",
      pages: "dist",
    }),
    files: {
      routes: "./routes",
      assets: "./public",
      appTemplate: "./index.html",
    },
    alias: {
      "@": "src",
    },
  },
};

export default config;
