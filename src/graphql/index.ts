import { resolve } from 'path'
import { buildSchema } from 'type-graphql'

import { StratResolver } from '@/modules/strat/strat.resolvers'

export const createSchema = async (generateSnapshot = true) =>
  buildSchema({
    emitSchemaFile: !generateSnapshot
      ? false
      : { path: resolve(__dirname, 'snapshot.graphql') },
    dateScalarMode: 'isoDate',
    resolvers: [StratResolver],
  })
