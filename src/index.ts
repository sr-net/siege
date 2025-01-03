import { serve } from "@hono/node-server"

import { buildApp } from "#r/app.ts"
import { config } from "#r/config.ts"
import { dbClient } from "#r/db.ts"
import { createSchema } from "#r/graphql/schema.ts"

const start = async () => {
  const schema = await createSchema()
  const app = await buildApp(schema)

  await dbClient.ensureConnected()

  serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    () => {
      console.log(`Listening on ${config.port}`)
    },
  )
}

void start()
