import { ApolloServer } from 'apollo-server-express'
import Express, { Express as IExpress } from 'express'
import Helmet from 'helmet'
import cors from 'cors'

import { config } from '@/config'
import { createSchema } from '@/graphql'
import { router } from '@/router'

export const createApp = (): IExpress => {
  const app = Express()

  app.use(Helmet())

  app.use(cors())
  app.use(router)

  return app
}

export const connectApolloServer = async (app: IExpress) => {
  const server = new ApolloServer({
    schema: await createSchema(),
    introspection: true,
    engine: config.apolloEngine,
    formatError(error) {
      // Workaround for apollo adding two UserInputError details for some reason
      if (error.extensions?.code === 'BAD_USER_INPUT') {
        const key = Object.keys(error.extensions.exception)?.[0]

        delete error.extensions[key]
      }

      return error
    },
  })

  server.applyMiddleware({ app })

  return server
}
