import "reflect-metadata"

import { init } from "@sentry/node"

import { connectApolloServer, createApp } from "@/apollo"
import { config } from "@/config"
import { Environment } from "@/constants"
import { connectToDatabase } from "@/db"
import { createSchema } from "@/graphql"

const shouldGenerateSnapshot = process.argv.find(
  (str) => str.includes("--snapshot") || str.includes("-shot"),
)

if (shouldGenerateSnapshot) {
  void createSchema().then(() => {
    // eslint-disable-next-line no-process-exit,unicorn/no-process-exit
    process.exit(0)
  })
} else {
  if (config.env === Environment.PRODUCTION) {
    init(config.sentry)
  }

  const start = async () => {
    await connectToDatabase()

    const app = createApp()
    await connectApolloServer(app)

    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Listening on ${config.port}`)
    })
  }

  void start()
}
