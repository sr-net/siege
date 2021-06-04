module.exports = {
  extends: [
    "plugin:@beequeue/base",
    "plugin:@beequeue/node",
    "plugin:@beequeue/typescript",
    "plugin:@beequeue/prettier",
  ],
  env: {
    es2021: true,
    node: true,
  },
  rules: {
    "unicorn/prefer-module": "off",
    "unicorn/import-style": "off",
  },
}
