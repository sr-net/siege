// import { setTimeout } from "node:timers/promises"

import { serve } from "@hono/node-server"

import { buildApp } from "@/app"
import { config } from "@/config"
import { dbClient } from "@/db"
import { createSchema } from "@/graphql/schema"

const start = async () => {
  const schema = createSchema()
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
