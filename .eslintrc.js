module.exports = {
  ignorePatterns: ["*.generated.ts", "dbschema/**"],
  extends: [
    "plugin:@beequeue/base",
    "plugin:@beequeue/node",
    "plugin:@beequeue/typescript",
  ],
  rules: {
    "unicorn/prefer-module": "off",
  },
}
