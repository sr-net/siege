import { defineConfig } from "oxfmt"

export default defineConfig({
  ignorePatterns: ["dbschema/**"],

  printWidth: 90,
  semi: false,
  useTabs: false,

  sortImports: {
    type: "natural",
    internalPattern: ["#/", "@/"],
    groups: ["builtin", "external", "internal", "parent", "sibling", "index", "unknown"],
  },

  sortPackageJson: false,
})
