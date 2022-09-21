import { readFileSync } from "fs"
import path from "path"
import { setTimeout } from "timers/promises"

import { test, expect } from "vitest"

import { createSchema } from "@/graphql/schema"

test("generated schema should be identical to snapshot", async () => {
  const snapshot = readFileSync(path.resolve(__dirname, "snapshot.graphql")).toString()

  createSchema()
  await setTimeout(1000)

  const newSnapshot = readFileSync(path.resolve(__dirname, "snapshot.graphql")).toString()

  expect(newSnapshot).toEqual(snapshot)
})
