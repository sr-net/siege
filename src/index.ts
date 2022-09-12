import "@abraham/reflection"

import { init } from "@sentry/node"

import { buildApp } from "@/app"
import { config } from "@/config"
import { Environment } from "@/constants"
import { dataSource } from "@/db"
import { createSchema } from "@/graphql"

const shouldGenerateSnapshot = process.argv.find(
  (str) => str.includes("--snapshot") || str.includes("-shot"),
)

if (shouldGenerateSnapshot) {
  void createSchema().then(() => {
    // eslint-disable-next-line n/no-process-exit,unicorn/no-process-exit
    process.exit(0)
  })
} else {
  if (config.env === Environment.PRODUCTION) {
    init(config.sentry)
  }

  const start = async () => {
    await dataSource.initialize()

    const app = await buildApp()

    await app.listen({
      host: "0.0.0.0",
      port: config.port,
    })

    // eslint-disable-next-line no-console
    console.log(`Listening on ${config.port}`)
  }

  void start()
}
