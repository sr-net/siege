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
import { dedent } from "ts-dedent"

import e, { Gamemode } from "@/edgedb"
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

const params = {
  atk: e.optional(e.bool),
  def: e.optional(e.bool),
  excludeShortIds: e.optional(e.array(e.int32)),
  gamemode: e.optional(e.Gamemode),
  page: e.optional(e.int32),
  shortId: e.optional(e.int32),
  uuid: e.optional(e.uuid),
}

const query = e.params(params, (_params) =>
  e.select(e.Strat, () => ({
    id: true,
    shortId: true,
    title: true,
    description: true,
    atk: true,
    def: true,
    gamemodes: true,
    author: {
      name: true,
      kind: true,
      url: true,
    },
    score: true,

    // filter: getFilters(strat as any, params),
  })),
)

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

export const getFilters = (
  strat: typeof e.Strat,
  args: NexusGenArgTypes["Query"]["strats"],
): string => {
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
      `.atk = ${args.atk?.toString() ?? "false"}`,
      `.def = ${args.def?.toString() ?? "false"}`,
    )
  }

  if (args.gamemode != null) {
    filters.push("contains(.gamemodes, <Gamemode>$gamemode)")
  }

  return filters.join(" and ")
}

console.log(query.toEdgeQL())

export const StratQuery = objectType({
  name: "Query",
  definition(t) {
    t.field("strat", {
      type: Strat,
      args: {
        atk: booleanArg({
          description:
            "Set to `true` to filter for Strats that work on attack. Setting to `false` does nothing.",
        }),
        def: booleanArg({
          description:
            "Set to `true` to filter for Strats that work on defense. Setting to `false` does nothing.",
        }),
        excludeShortIds: list(
          nonNull(
            intArg({ description: "A list of Strats to be excluded from the result." }),
          ),
        ),
        gamemode: arg({
          type: GamemodeEnum,
          description: "Filter by gamemode",
        }),
        random: booleanArg({
          description:
            "Return a random Strat matching the arguments instead of the first best one.",
        }),
        shortId: intArg(),
        uuid: idArg(),
      },

      resolve: async (_, _args) => {
        return { test: true }
      },
    })
  },
})
