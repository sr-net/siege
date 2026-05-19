import { defineConfig } from "oxfmt"

export default defineConfig({
  ignorePatterns: ["dbschema/**"],

  printWidth: 90,
  semi: false,
  useTabs: false,

  sortImports: false,
  sortPackageJson: false,
})
