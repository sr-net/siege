import { enumType, objectType } from "nexus"
import { FieldResolver } from "nexus/src/typegenTypeHelpers"
import { dedent } from "ts-dedent"

import { dbClient } from "@/db"
import { Gamemode } from "@/edgedb/types"
import { DateTime } from "@/graphql/scalars"
import { NexusGenArgTypes, NexusGenTypes } from "@/graphql/types.generated"

import { Author } from "./author.entity"

export const GamemodeEnum = enumType({
  name: "Gamemode",
  members: Object.values(Gamemode),
})

export const Strat = objectType({
  name: "Strat",
  definition(t) {
    t.nonNull.id("uuid")
    t.nonNull.int("shortId")

    t.nonNull.string("title")
    t.nonNull.string("description")

    t.nonNull.boolean("atk")
    t.nonNull.boolean("def")
    t.nonNull.list.nonNull.field("gamemodes", { type: GamemodeEnum })

    t.nonNull.field("author", { type: Author })

    t.nonNull.int("score")
    // t.nonNull.boolean("liked")

    t.nonNull.boolean("submission")
    t.field("acceptedAt", { type: DateTime })
  },
})

export const StratPage = objectType({
  name: "StratPage",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: Strat })
    t.nonNull.int("lastPage")
  },
})

const baseStratQuery = dedent`
  SELECT Strat {
    uuid := .id,
    shortId,
    title,
    description,
    atk,
    def,
    gamemodes,
    score,
    author: {
      name,
      type := .kind,
      url,
    },
  }
`

export const getFilters = (
  args: NexusGenArgTypes["Query"]["strat"],
): { filters: string; args: NexusGenArgTypes["Query"]["strat"] } => {
  if (args.uuid != null) {
    return {
      filters: ".id = <uuid>$uuid",
      args: {
        uuid: args.uuid,
      },
    }
  }

  if (args.shortId != null) {
    return {
      filters: ".shortId = <int32>$shortId",
      args: {
        shortId: args.shortId,
      },
    }
  }

  const newArgs: Record<string, unknown> = {}
  const filters = [
    // Not a submission
    ".submission = false",
  ]

  if (args.excludeShortIds != null && args.excludeShortIds.length > 0) {
    filters.push("not contains(<array<int32>>$excludeShortIds, .shortId)")
    newArgs["excludeShortIds"] = args.excludeShortIds
  }

  if (args.atk === true || args.def === true) {
    filters.push(".atk = <bool>$atk", ".def = <bool>$def")

    newArgs["atk"] = args.atk ?? false
    newArgs["def"] = args.def ?? false
  }

  if (args.gamemode != null) {
    filters.push("contains(.gamemodes, <Gamemode>$gamemode)")
    newArgs["gamemode"] = args.gamemode
  }

  return {
    filters: `filter ${filters.join(" and ")}`,
    args: newArgs,
  }
}

export const resolveStrat: FieldResolver<"Query", "strat"> = async (_, gqlArgs, ctx) => {
  const { filters, args } = getFilters(gqlArgs)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const result = (await dbClient.querySingle(
    `${baseStratQuery} ${filters} limit 1`,
    args,
  )) as NexusGenTypes["allTypes"]["Strat"] | null

  if (result == null) return null
  ctx.logger.info({ result }, "HELLO?")

  return result
}
