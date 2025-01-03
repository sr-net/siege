import { readFileSync } from "node:fs"
import path from "node:path"
import { setTimeout } from "node:timers/promises"

import { expect, it } from "vitest"

import { createSchema } from "@/graphql/schema"

it("generated schema should be identical to snapshot", async () => {
  const snapshot = readFileSync(path.resolve(__dirname, "snapshot.graphql")).toString()

  await createSchema()
  await setTimeout(1000)

  const newSnapshot = readFileSync(path.resolve(__dirname, "snapshot.graphql")).toString()

  expect(newSnapshot).toEqual(snapshot)
})
