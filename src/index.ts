import { serve } from "@hono/node-server"

import { buildApp } from "@/app.ts"
import { config } from "@/config.ts"
import { dbClient } from "@/db.ts"
import { createSchema } from "@/graphql/schema.ts"

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
