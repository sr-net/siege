import path from "node:path"

import { makeSchema } from "nexus"

import { config } from "@/config"
import { Environment } from "@/constants"
import * as types from "@/graphql/resolvers"

export const createSchema = () => {
  const isSnapshotRun = process.argv.some(
    (str) => str.includes("--snapshot") || str.includes("-shot"),
  )

  return makeSchema({
    types,

    contextType: {
      module: path.resolve(import.meta.dirname, "../app.ts"),
      export: "GraphQLContext",
    },
    sourceTypes: {
      modules: [],
      mapping: {
        DateTime: "Date",
      },
    },

    shouldGenerateArtifacts: isSnapshotRun || config.env === Environment.DEVELOPMENT,
    shouldExitAfterGenerateArtifacts: isSnapshotRun,
    prettierConfig: path.resolve(import.meta.dirname, "../../.prettierrc"),
    outputs: {
      schema: path.resolve(import.meta.dirname, "snapshot.graphql"),
      typegen: path.resolve(import.meta.dirname, "types.generated.ts"),
    },
  })
}
