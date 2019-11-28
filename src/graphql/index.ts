import { resolve } from 'path'
import { buildSchema } from 'type-graphql'

import { StratResolver } from '@/modules/strat/strat.resolvers'
import { LikeResolver } from '@/modules/like/like.resolvers'

export const createSchema = async (generateSnapshot = true) =>
  buildSchema({
    emitSchemaFile: !generateSnapshot
      ? false
      : { path: resolve(__dirname, 'snapshot.graphql') },
    dateScalarMode: 'isoDate',
    resolvers: [StratResolver, LikeResolver],
  })
