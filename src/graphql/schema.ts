import path from "path"

import { makeSchema } from "nexus"

import * as types from "@/graphql/resolvers"

export const createSchema = (generateSnapshot = true) =>
  makeSchema({
    types,

    sourceTypes: {
      modules: [],
      mapping: {
        DateTime: "Date",
      },
    },

    shouldGenerateArtifacts: generateSnapshot,
    shouldExitAfterGenerateArtifacts: generateSnapshot,
    prettierConfig: path.resolve(__dirname, "../../.prettierrc"),
    outputs: {
      schema: path.resolve(__dirname, "snapshot.graphql"),
      typegen: path.resolve(__dirname, "types.generated.ts"),
    },
  })
