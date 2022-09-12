import path from "path"

import { buildSchema } from "type-graphql"

export const createSchema = async (generateSnapshot = true) =>
  buildSchema({
    emitSchemaFile: !generateSnapshot
      ? false
      : { path: path.resolve(__dirname, "snapshot.graphql") },
    dateScalarMode: "isoDate",
    resolvers: [path.resolve(__dirname, "..", "modules", "**", "*.resolvers.ts")],
  })
