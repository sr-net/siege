import { resolve } from 'path'
import { buildSchema } from 'type-graphql'

import { BoardgameResolver } from '@/modules/boardgame/boardgame.resolvers'

export const createSchema = async (generateSnapshot = true) =>
  buildSchema({
    emitSchemaFile: !generateSnapshot
      ? false
      : { path: resolve(__dirname, 'snapshot.graphql') },
    dateScalarMode: 'isoDate',
    resolvers: [BoardgameResolver],
  })
