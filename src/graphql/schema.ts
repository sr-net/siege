import path from "path"

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
      module: path.resolve(__dirname, "../app.ts"),
      export: "Context",
    },
    sourceTypes: {
      modules: [],
      mapping: {
        DateTime: "Date",
      },
    },

    shouldGenerateArtifacts: isSnapshotRun || config.env === Environment.DEVELOPMENT,
    shouldExitAfterGenerateArtifacts: isSnapshotRun,
    prettierConfig: path.resolve(__dirname, "../../.prettierrc"),
    outputs: {
      schema: path.resolve(__dirname, "snapshot.graphql"),
      typegen: path.resolve(__dirname, "types.generated.ts"),
    },
  })
}
