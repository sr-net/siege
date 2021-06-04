import { readFileSync } from 'fs'
import { resolve } from 'path'

import { createSchema } from '@/graphql/index'

test('generated schema should be identical to snapshot', async () => {
  const snapshot = readFileSync(
    resolve(__dirname, 'snapshot.graphql'),
  ).toString()

  await createSchema(true)

  const newSnapshot = readFileSync(
    resolve(__dirname, 'snapshot.graphql'),
  ).toString()

  expect(newSnapshot).toEqual(snapshot)
})
