import { defineConfig } from "vite";
import { resolve } from "path";

import react from "@vitejs/plugin-react";

// biome-ignore lint/nursery/noDefaultExport: Required for Vite configuration
export default defineConfig({
  plugins: [react()],
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    strictPort: true,
    watch: {
      // tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari15",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  resolve: {
    alias: {
      "@app": resolve(__dirname, "./src"),
      "@api": resolve(__dirname, "./src/api"),
      "@bindings": resolve(__dirname, "./src/bindings"),
      "@components": resolve(__dirname, "./src/components"),
      "@features": resolve(__dirname, "./src/features"),
      "@store": resolve(__dirname, "./src/store"),
      "@utils": resolve(__dirname, "./src/utils"),
    },
  },
});
