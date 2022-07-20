import fs from "fs/promises"
import path from "path"

import { createSchema } from "@/graphql/index"

test("generated schema should be identical to snapshot", async () => {
  const snapshot = await fs.readFile(path.resolve(__dirname, "snapshot.graphql"), "utf8")

  await createSchema(true)

  const newSnapshot = await fs.readFile(
    path.resolve(__dirname, "snapshot.graphql"),
    "utf8",
  )

  expect(newSnapshot).toEqual(snapshot)
})
