import { readFileSync } from "node:fs"
import path from "node:path"
import { it, type TestContext } from "node:test"
import { setTimeout } from "node:timers/promises"

import { createSchema } from "#/graphql/schema.ts"

it("generated schema should be identical to snapshot", async (t: TestContext) => {
  const snapshot = readFileSync(path.resolve(import.meta.dirname, "snapshot.graphql")).toString()

  await createSchema()
  await setTimeout(1000)

  const newSnapshot = readFileSync(path.resolve(import.meta.dirname, "snapshot.graphql"), "utf8")

  t.assert.strictEqual(newSnapshot, snapshot)
})
