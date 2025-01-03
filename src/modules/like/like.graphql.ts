import { field, mutation, resolver, useContext } from "@gqloom/valibot"
import { dedent } from "ts-dedent"
import * as v from "valibot"

import type { GraphQLContext } from "@/app.ts"
import { dbClient } from "@/db.ts"
import { Uuid } from "@/graphql/scalars.ts"
import { type DefaultStratObject, stratGqlFields } from "@/modules/strat/strat.db.ts"
import { Strat } from "@/modules/strat/strat.graphql.ts"

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

export const likedResolver = resolver.of(Strat, {
  liked: field(v.boolean(), async ({ uuid }) => {
    const ctx = useContext<GraphQLContext>()

    if (ctx.var.sessionUuid == null) return false

    return dbClient.queryRequiredSingle<boolean>(likedQuery, {
      id: uuid,
      sessionId: ctx.var.sessionUuid,
    })
  }),
})

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

type QueryResult = { strat: DefaultStratObject }

export const likeResolver = resolver({
  likeStrat: mutation(v.nullish(Strat), {
    input: {
      uuid: Uuid,
    },
    resolve: async (args) => {
      const ctx = useContext<GraphQLContext>()

      const result = await dbClient.queryRequiredSingle<QueryResult>(likeQuery, {
        stratId: args.uuid,
        sessionId: ctx.var.sessionUuid,
      })

      ctx.var.logger.debug({ result })

      return result.strat
    },
  }),

  unlikeStrat: mutation(v.nullish(Strat), {
    input: {
      uuid: Uuid,
    },
    resolve: async (args) => {
      const ctx = useContext<GraphQLContext>()

      if (ctx.var.sessionUuid == null) {
        ctx.var.setSessionUuid()
      }

      const result = await dbClient.queryRequiredSingle<QueryResult>(unlikeQuery, {
        stratId: args.uuid,
        sessionId: ctx.var.sessionUuid,
      })

      ctx.var.logger.debug({ result })

      return result.strat
    },
  }),
})
