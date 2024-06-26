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
import { Author } from "./author.graphql"
import { dbClient } from "@/db"
import { DateTime } from "@/graphql/scalars"
import type { NexusGenArgTypes, NexusGenTypes } from "@/graphql/types.generated"
import { resolveLiked } from "@/modules/like/like.graphql"
import { stratGqlFields } from "@/modules/strat/strat.db"

export const getFilters = <
  Args extends NexusGenArgTypes["Query"]["strat"] | NexusGenArgTypes["Query"]["strats"],
>(
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
      } as never,
    }
  }

  if (args.shortId != null) {
    return {
      filters: ".shortId = <int32>$shortId",
      args: {
        shortId: args.shortId,
      } as never,
    }
  }

  const newArgs: Record<string, unknown> = {}
  const filters = [
    // Not a submission
    ".submission = false",
  ]

  if (args.excludeShortIds != null && args.excludeShortIds.length > 0) {
    filters.push("not contains(<array<int32>>$excludeShortIds, .shortId)")
    newArgs.excludeShortIds = args.excludeShortIds
  }

  if (args.atk === true || args.def === true) {
    filters.push(".atk = <bool>$atk", ".def = <bool>$def")

    newArgs.atk = args.atk ?? false
    newArgs.def = args.def ?? false
  }

  if (args.gamemode != null) {
    filters.push("contains(.gamemodes, <Gamemode>$gamemode)")
    newArgs.gamemode = args.gamemode
  }

  if ("page" in args && args.page != null) {
    newArgs.page = args.page
  }

  return {
    filters: `${filters.join(" and ")}`,
    args: (Object.keys(newArgs).length > 0 ? newArgs : undefined) as never,
  }
}

// Strat / Query.strat

export const GamemodeEnum = enumType({
  name: "Gamemode",
  members: ["BOMBS", "HOSTAGE", "CAPTURE_AREAS"],
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
  select Strat {
    ${stratGqlFields}
  }
`

const createRandomStratShortIdQuery = (filters: string) => dedent`
  with S := (select Strat { shortId } filter ${filters}).shortId
  select array_agg(S)[<int64>round(random() * count(S))]
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
    if (gqlArgs.random === true && (gqlArgs.shortId != null || gqlArgs.uuid != null)) {
      throw new Error("Can't specify `shortId` or `uuid` when `random` is true.")
    }

    if (gqlArgs.random === true) {
      const { filters, args } = getFilters(gqlArgs)
      const result = await dbClient.queryRequiredSingle<number>(
        createRandomStratShortIdQuery(filters),
        args,
      )

      gqlArgs.random = undefined
      gqlArgs.shortId = result
    }

    const { filters, args } = getFilters(gqlArgs)
    const result = await dbClient.querySingle<NexusGenTypes["allTypes"]["Strat"]>(
      `${baseStratQuery} filter ${filters} order by .shortId limit 1`,
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
    ${baseStratQuery} filter ${filters} order by .shortId
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

      items: any[]
    }>(query, args)

    return result!
  },
})
