import 'reflect-metadata'
import { init } from '@sentry/node'

import { Environment } from '@/constants'
import { config } from '@/config'
import { connectToDatabase } from '@/db'
import { connectApolloServer, createApp } from '@/apollo'
import { createSchema } from '@/graphql'

const shouldGenerateSnapshot = process.argv.find(
  str => str.includes('--snapshot') || str.includes('-shot'),
)

if (shouldGenerateSnapshot) {
  createSchema().then(() => {
    // eslint-disable-next-line no-process-exit
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

  start()
}
