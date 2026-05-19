import fs from "node:fs"
import path from "node:path"

import { weave } from "@gqloom/core"
import { asyncContextProvider } from "@gqloom/core/context"
import { ValibotWeaver } from "@gqloom/valibot"
import { lexicographicSortSchema, printSchema } from "graphql"

import { config } from "#/config.ts"
import { GQLDateTime } from "#/graphql/scalars.ts"
import { likedResolver, likeResolver } from "#/modules/like/like.graphql.ts"
import { stratResolver } from "#/modules/strat/strat.graphql.ts"

const weaver = ValibotWeaver.config({
  presetGraphQLType: (schema) => {
    switch (schema.type) {
      case "date":
        return GQLDateTime
    }
  },
})

export const createSchema = async () => {
  const isSnapshotRun = process.argv.some(
    (str) => str.includes("--snapshot") || str.includes("-shot"),
  )

  const schema = weave(
    weaver,
    asyncContextProvider,
    stratResolver,
    likedResolver,
    likeResolver,
  )

  if (isSnapshotRun || config.env === "development") {
    const snapshotFilePath = path.resolve(import.meta.dirname, "snapshot.graphql")

    let contents = printSchema(lexicographicSortSchema(schema))
    contents = await import("oxfmt").then(
      async ({ format }) => (await format("snapshot.graphql", contents)).code,
    )

    fs.writeFileSync(snapshotFilePath, contents)

    if (isSnapshotRun) {
      process.exit(0)
    }
  }

  return schema
}
