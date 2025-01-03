import { asEnumType, query, resolver } from "@gqloom/valibot"
import { dedent } from "ts-dedent"
import * as v from "valibot"

import { dbClient } from "@/db"
import { PositiveInteger, Uuid } from "@/graphql/scalars"
import { type DefaultStratObject, stratGqlFields } from "@/modules/strat/strat.db"

import { Author } from "./author.graphql"

type InputObject = {
  shortId: number | null | undefined
  uuid: string | null | undefined
  atk: boolean | null | undefined
  def: boolean | null | undefined
  excludeShortIds: number[] | null | undefined
  gamemode: "BOMBS" | "HOSTAGE" | "CAPTURE_AREAS" | null | undefined
}

type SingleInputObject = InputObject & { random: boolean | null | undefined }
type PageInputObject = InputObject & { page: number | null | undefined }

export const getFilters = <Args extends SingleInputObject | PageInputObject>(
  args: Partial<Args>,
): {
  filters: string
  args: Args extends { random: boolean | null | undefined }
    ? Partial<PageInputObject>
    : Partial<SingleInputObject>
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

export const GamemodeEnum = v.pipe(
  v.picklist(["BOMBS", "HOSTAGE", "CAPTURE_AREAS"]),
  asEnumType({ name: "Gamemode" }),
)

export const Strat = v.object({
  __typename: v.literal("Strat"),

  uuid: Uuid,
  shortId: PositiveInteger,

  title: v.string(),
  description: v.string(),

  atk: v.boolean(),
  def: v.boolean(),
  gamemodes: v.array(GamemodeEnum),

  author: Author,

  score: PositiveInteger,

  submission: v.boolean(),
  acceptedAt: v.nullish(v.date()),
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

// StratPage / Query.strats

export const StratPage = v.object({
  __typename: v.literal("StratPage"),

  items: v.array(Strat),
  lastPage: PositiveInteger,
})

const PAGE_SIZE = 10
const createStratsQuery = (gqlArgs: PageInputObject) => {
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

export const stratResolver = resolver({
  strat: query(v.nullish(Strat), {
    input: {
      shortId: v.nullish(PositiveInteger),
      uuid: v.nullish(Uuid),
      atk: v.nullish(v.boolean()),
      def: v.nullish(v.boolean()),
      excludeShortIds: v.nullish(v.array(PositiveInteger)),
      gamemode: v.nullish(GamemodeEnum),
      random: v.nullish(v.boolean()),
    },
    resolve: async (gqlArgs) => {
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
      const result = await dbClient.querySingle<DefaultStratObject>(
        `${baseStratQuery} filter ${filters} order by .shortId limit 1`,
        args,
      )

      if (result == null) return null

      return result
    },
  }),

  strats: query(StratPage, {
    input: {
      shortId: v.nullish(PositiveInteger),
      uuid: v.nullish(Uuid),
      atk: v.nullish(v.boolean()),
      def: v.nullish(v.boolean()),
      excludeShortIds: v.nullish(v.array(PositiveInteger)),
      gamemode: v.nullish(GamemodeEnum),
      page: PositiveInteger,
    },
    resolve: async (gqlArgs) => {
      const { query, args } = createStratsQuery(gqlArgs)

      const result = await dbClient.querySingle<{
        lastPage: number

        items: DefaultStratObject[]
      }>(query, args)

      return {
        __typename: "StratPage" as const,
        ...result!,
      }
    },
  }),
})
