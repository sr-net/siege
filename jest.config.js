/* eslint-disable n/no-unpublished-require,unicorn/import-style */
const { resolve } = require("path")

const { pathsToModuleNameMapper } = require("ts-jest")

const { compilerOptions } = require("./tsconfig")

const rootDir = resolve(__dirname)

/** @type {import('ts-jest').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",

  setupFiles: [`${rootDir}/jest.setup.ts`],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
}
