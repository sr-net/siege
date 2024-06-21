import antfu from "@antfu/eslint-config"

export default antfu({
  ignores: ["**/*.generated.ts"],
  stylistic: false,
  vue: false,
  typescript: {
    tsconfigPath: "tsconfig.json",
    overrides: {
      "no-console": "off",
      "node/prefer-global/process": "off",
      "ts/no-use-before-define": "off",
      "ts/consistent-type-definitions": "off",
      "ts/no-unsafe-argument": "off",
      "ts/no-unsafe-assignment": "off",
      "ts/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
    },
  },
})
