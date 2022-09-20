import {
  arg,
  booleanArg,
  enumType,
  idArg,
  intArg,
  list,
  nonNull,
  objectType,
  queryField,
} from "nexus"
import { dedent } from "ts-dedent"

import { dbClient } from "@/db"
import { Gamemode } from "@/edgedb/types"
import { DateTime } from "@/graphql/scalars"
import { NexusGenArgTypes, NexusGenTypes } from "@/graphql/types.generated"
import { resolveLiked } from "@/modules/like/like.graphql"

import { Author } from "./author.graphql"

export const getFilters = <Args extends NexusGenArgTypes["Query"]["strat"]>(
  args: Args,
): {
  filters: string
  args: Args extends NexusGenArgTypes["Query"]["strats"]
    ? NexusGenArgTypes["Query"]["strats"]
    : NexusGenArgTypes["Query"]["strat"]
} => {
  if (args.uuid != null) {
    return {
      filters: ".id = <uuid>$uuid",
      args: {
        uuid: args.uuid,
      } as any,
    }
  }

  if (args.shortId != null) {
    return {
      filters: ".shortId = <int32>$shortId",
      args: {
        shortId: args.shortId,
      } as any,
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

  if ((args as any).page != null) {
    newArgs["page"] = (args as any).page
  }

  return {
    filters: `filter ${filters.join(" and ")}`,
    args: newArgs as any,
  }
}

// Strat / Query.strat

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
    t.nonNull.boolean("liked", {
      resolve: resolveLiked,
    })

    t.nonNull.boolean("submission")
    t.field("acceptedAt", { type: DateTime })
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

export const queryStrat = queryField("strat", {
  type: Strat,
  args: {
    shortId: intArg(),
    uuid: idArg(),
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
  },
  resolve: async (_, gqlArgs) => {
    const { filters, args } = getFilters(gqlArgs)
    const result = await dbClient.querySingle<NexusGenTypes["allTypes"]["Strat"]>(
      `${baseStratQuery} FILTER ${filters} LIMIT 1`,
      args,
    )

    if (result == null) return null

    return result
  },
})

// StratPage / Query.strats

export const StratPage = objectType({
  name: "StratPage",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: Strat })
    t.nonNull.int("lastPage")
  },
})

const PAGE_SIZE = 10
const createStratsQuery = (gqlArgs: NexusGenArgTypes["Query"]["strats"]) => {
  const { filters, args } = getFilters(gqlArgs)
  const baseQuery = dedent`
    ${baseStratQuery} ${filters} order by .shortId
  `

  return {
    args,
    query: dedent`
      select {
        items := (${baseQuery} OFFSET ((<int64>$page - 1) * ${PAGE_SIZE}) LIMIT ${PAGE_SIZE}),
        lastPage := math::floor(count((${baseQuery})) / ${PAGE_SIZE}),
      };
    `,
  }
}

export const queryStrats = queryField("strats", {
  type: nonNull(StratPage),
  args: {
    uuid: idArg(),
    shortId: intArg(),
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
    page: intArg({ default: 1 }),
  },
  resolve: async (_, gqlArgs) => {
    const { query, args } = createStratsQuery(gqlArgs)

    const result = await dbClient.querySingle<{
      lastPage: number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: any[]
    }>(query, args)

    return result!
  },
})
