import "dotenv/config"

import { setTimeout } from "node:timers/promises"

import { buildApp } from "@/app"
import { config } from "@/config"
import { dbClient } from "@/db"
import { createSchema } from "@/graphql/schema"

const start = async () => {
  const schema = createSchema()
  const app = await buildApp(schema)

  await setTimeout(1000)
  await dbClient.ensureConnected()

  await app.listen({
    host: "0.0.0.0",
    port: config.port,
  })

  console.log(`Listening on ${config.port}`)
}

void start()
