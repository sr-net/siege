import path from "node:path"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("./src"),
    },
  },

  test: {
    env: loadEnv("", process.cwd(), ""),
  },
})
