import { resolve } from "path"

import { buildSchema } from "type-graphql"

export const createSchema = async (generateSnapshot = true) =>
  buildSchema({
    emitSchemaFile: !generateSnapshot
      ? false
      : { path: resolve(__dirname, "snapshot.graphql") },
    dateScalarMode: "isoDate",
    resolvers: [resolve(__dirname, "..", "modules", "**", "*.resolvers.ts")],
  })
