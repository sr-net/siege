import fs from "node:fs"
import path from "node:path"

import { ValibotWeaver, weave } from "@gqloom/valibot"
import { lexicographicSortSchema, printSchema } from "graphql"

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

    let contents = printSchema(lexicographicSortSchema(schema))
    contents = await import("prettier").then(async ({ format }) =>
      format(contents, { parser: "graphql" }),
    )

    fs.writeFileSync(snapshotFilePath, contents)

    if (isSnapshotRun) {
      process.exit(0)
    }
  }

  return schema
}
