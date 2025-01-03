import fs from "node:fs"
import path from "node:path"

import { ValibotWeaver, weave } from "@gqloom/valibot"
import { lexicographicSortSchema, printSchema } from "graphql"
import { format } from "prettier"

import { config } from "#r/config.ts"
import { GQLDateTime } from "#r/graphql/scalars.ts"
import { likedResolver, likeResolver } from "#r/modules/like/like.graphql.ts"
import { stratResolver } from "#r/modules/strat/strat.graphql.ts"

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

  const schema = weave(weaver, stratResolver, likedResolver, likeResolver)

  if (isSnapshotRun || config.env === "development") {
    const snapshotFilePath = path.resolve(import.meta.dirname, "snapshot.graphql")
    const contents = printSchema(lexicographicSortSchema(schema))

    fs.writeFileSync(snapshotFilePath, await format(contents, { parser: "graphql" }))

    if (isSnapshotRun) {
      process.exit(0)
    }
  }

  return schema
}
