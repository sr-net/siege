import { type FieldResolver, idArg, mutationField, nonNull } from "nexus"
import { dedent } from "ts-dedent"

import { dbClient } from "@/db"
import type { NexusGenTypes } from "@/graphql/types.generated"
import { stratGqlFields } from "@/modules/strat/strat.db"

const likedQuery = dedent`
  select exists (
    select \`Like\`
    filter
      .strat.id = <uuid>$id
    and
      .sessionId = <uuid>$sessionId
    and
      .active = true
  );
`

export const resolveLiked: FieldResolver<"Strat", "liked"> = (strat, _, ctx) => {
  if (ctx.var.sessionUuid == null) return false

  return dbClient.queryRequiredSingle<boolean>(likedQuery, {
    id: strat.uuid,
    sessionId: ctx.var.sessionUuid,
  })
}

// Mutations

const likeQuery = dedent`
  select (
    insert \`Like\` {
      active := true,
      sessionId := <uuid>$sessionId,
      strat := (
        select Strat filter .id = <uuid>$stratId
      )
    }
    unless conflict on ((.strat, .sessionId))
    else (
      update \`Like\`
      set {
        active := true
      }
    )
  ) {
    strat: {
      ${stratGqlFields}
    }
  }
`

export const mutationLikeStrat = mutationField("likeStrat", {
  type: "Strat",
  args: {
    uuid: nonNull(idArg()),
  },

  resolve: async (_, args, ctx) => {
    if (ctx.var.sessionUuid == null) {
      ctx.var.setSessionUuid()
    }

    const result = await dbClient.queryRequiredSingle<{
      strat: Omit<NexusGenTypes["allTypes"]["Strat"], "liked">
    }>(likeQuery, {
      stratId: args.uuid,
      sessionId: ctx.var.sessionUuid,
    })

    ctx.var.logger.debug({ result })

    return result.strat
  },
})

const unlikeQuery = dedent`
  select (
    update \`Like\`
    filter
      .strat.id = <uuid>$stratId
    and
      .sessionId = <uuid>$sessionId
    set {
      active := false,
    }
  ) {
    strat: {
      ${stratGqlFields}
    }
  }
`

export const mutationUnlikeStrat = mutationField("unlikeStrat", {
  type: "Strat",
  args: {
    uuid: nonNull(idArg()),
  },

  resolve: async (_, args, ctx) => {
    if (ctx.var.sessionUuid == null) {
      ctx.var.setSessionUuid()
    }

    const result = await dbClient.queryRequiredSingle<{
      strat: Omit<NexusGenTypes["allTypes"]["Strat"], "liked">
    }>(unlikeQuery, {
      stratId: args.uuid,
      sessionId: ctx.var.sessionUuid,
    })

    ctx.var.logger.debug({ result })

    return result.strat
  },
})
