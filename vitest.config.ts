import { loadEnvFile } from "node:process"

import { defineConfig } from "vitest/config"

try {
  loadEnvFile()
} catch {
  // ignore
}

export default defineConfig({
  test: {
    experimental: {
      preParse: true,
      viteModuleRunner: false,
    },
  },
})
