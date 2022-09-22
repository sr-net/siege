import { FieldResolver, idArg, mutationField, nonNull } from "nexus"
import { isNil } from "remeda"
import { dedent } from "ts-dedent"

import { dbClient } from "@/db"
import { NexusGenTypes } from "@/graphql/types.generated"
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
  if (ctx.sessionUuid == null) return false

  return dbClient.queryRequiredSingle<boolean>(likedQuery, {
    id: strat.uuid,
    sessionId: ctx.sessionUuid,
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
    if (isNil(ctx.sessionUuid)) {
      ctx.sessionUuid = ctx.setSessionUuid()
    }

    const result = await dbClient.queryRequiredSingle<{
      strat: Omit<NexusGenTypes["allTypes"]["Strat"], "liked">
    }>(likeQuery, {
      stratId: args.uuid,
      sessionId: ctx.sessionUuid,
    })

    ctx.logger.debug({ result })

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
    if (isNil(ctx.sessionUuid)) {
      ctx.sessionUuid = ctx.setSessionUuid()
    }

    const result = await dbClient.queryRequiredSingle<{
      strat: Omit<NexusGenTypes["allTypes"]["Strat"], "liked">
    }>(unlikeQuery, {
      stratId: args.uuid,
      sessionId: ctx.sessionUuid,
    })

    ctx.logger.debug({ result })

    return result.strat
  },
})
