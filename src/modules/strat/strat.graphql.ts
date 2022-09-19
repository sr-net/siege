import {
  arg,
  booleanArg,
  enumType,
  idArg,
  intArg,
  list,
  nonNull,
  objectType,
} from "nexus"
import { FieldResolver } from "nexus/src/typegenTypeHelpers"
import { dedent } from "ts-dedent"

import { dbClient } from "@/db"
import { Gamemode, Strat as DBStrat } from "@/edgedb/types"
import { DateTime } from "@/graphql/scalars"
import { NexusGenArgTypes } from "@/graphql/types.generated"

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
    t.nonNull.boolean("liked")

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
    id,
    shortId,
    title,
    description,
    atk,
    def,
    gamemodes,
    score,
    author: {
      name,
      kind,
      url,
    },
  }
  filter .submission = false
`

export const getFilters = (args: NexusGenArgTypes["Query"]["strat"]): string => {
  if (args.uuid != null) {
    return ".id = $uuid"
  }

  if (args.shortId != null) {
    return ".shortId = $shortId"
  }

  const filters = [
    // Not a submission
    ".submission = false",
  ]

  if (args.excludeShortIds != null && args.excludeShortIds.length > 0) {
    filters.push("not contains($excludeShortIds, .shortId)")
  }

  if (args.atk === true || args.def === true) {
    filters.push(
      `.atk = ${Boolean(args.atk ?? "false").toString()}`,
      `.def = ${Boolean(args.def ?? "false").toString()}`,
    )
  }

  if (args.gamemode != null) {
    filters.push("contains(.gamemodes, <Gamemode>$gamemode)")
  }

  return filters.join(" and ")
}

export const resolveStrat: FieldResolver<"Query", "strat"> = async (_, args) => {
  const result = await dbClient.querySingle<DBStrat>(
    baseStratQuery + getFilters(args),
    args,
  )

  console.log(result)

  return result
}
