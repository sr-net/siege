import "@abraham/reflection"

import { setTimeout } from "timers/promises"

import { init } from "@sentry/node"

import { buildApp } from "@/app"
import { config } from "@/config"
import { Environment } from "@/constants"
import { dataSource } from "@/db"
import { createSchema } from "@/graphql/schema"

const shouldGenerateSnapshot = process.argv.some(
  (str) => str.includes("--snapshot") || str.includes("-shot"),
)

if (config.env === Environment.PRODUCTION) {
  init(config.sentry)
}

const start = async () => {
  const schema = createSchema(shouldGenerateSnapshot)
  const app = await buildApp(schema)

  await setTimeout(1000)
  await dataSource.initialize()

  await app.listen({
    host: "0.0.0.0",
    port: config.port,
  })

  // eslint-disable-next-line no-console
  console.log(`Listening on ${config.port}`)
}

void start()
