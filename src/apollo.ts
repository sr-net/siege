import { ApolloServer } from 'apollo-server-express'
import Express, { Express as IExpress } from 'express'
import { serialize } from 'cookie'
import Helmet from 'helmet'
import cors from 'cors'
import uuid from 'uuid/v4'

import { config } from '@/config'
import { createSchema } from '@/graphql'
import { router } from '@/router'

export type Context = {
  sessionUuid: string | null
  setSessionUuid: () => string
}

export const createApp = (): IExpress => {
  const app = Express()

  app.use(Helmet())

  app.use(cors({ origin: '*' }))
  app.use(router)

  return app
}

export const connectApolloServer = async (app: IExpress) => {
  const server = new ApolloServer({
    schema: await createSchema(),
    introspection: true,
    engine: config.apolloEngine,
    playground: true,
    context: ({ req, res }): Context => {
      let sessionUuid = req.headers.cookie?.match(
        /sessionUuid=([a-zA-Z\d-]+);?/,
      )?.[1]

      const setSessionUuid = () => {
        sessionUuid = uuid()

        res.header(
          'set-cookie',
          serialize('sessionUuid', sessionUuid, {
            maxAge: 60 * 60 * 24 * 30 * 12,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          }),
        )

        return sessionUuid
      }

      return {
        sessionUuid: sessionUuid ?? null,
        setSessionUuid,
      }
    },
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
