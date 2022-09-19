import { idArg, nonNull, objectType } from "nexus"

import { Strat } from "@/modules/strat/strat.graphql"

export { queryStrat, queryStrats } from "@/modules/strat/strat.graphql"

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
