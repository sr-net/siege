/* eslint-disable @typescript-eslint/no-var-requires,node/no-unpublished-require */
const { resolve } = require("path")

const { pathsToModuleNameMapper } = require("ts-jest")

const { compilerOptions } = require("./tsconfig")

const rootDir = resolve(__dirname)

/**
 * @type import('ts-jest/dist/types').ProjectConfigTsJest
 */
module.exports = {
  preset: "ts-jest",

  setupFiles: [`${rootDir}/jest.setup.ts`],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),

  globals: {
    "ts-jest": {
      // isolatedModules: true,
    },
  },
}
