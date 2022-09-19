import { arg, booleanArg, idArg, intArg, list, nonNull, objectType } from "nexus"

import {
  GamemodeEnum,
  getFilters,
  resolveStrat,
  Strat,
  StratPage,
} from "@/modules/strat/strat.graphql"
import { dbClient } from "@/db"
import { Strat as DBStrat } from "@/edgedb"

export { GamemodeEnum, Strat, StratPage } from "@/modules/strat/strat.graphql"

export const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("likeStrat", {
      type: Strat,
      args: {
        uuid: nonNull(idArg()),
      },
    })
    t.field("unlikeStrat", {
      type: Strat,
      args: {
        uuid: nonNull(idArg()),
      },
    })
  },
})

export const Query = objectType({
  name: "Query",
  definition(t) {
    t.field("strat", {
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

      resolve: resolveStrat,
    })

    t.nonNull.field("strats", {
      type: StratPage,
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
    })
  },
})
