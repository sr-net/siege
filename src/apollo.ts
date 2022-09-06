import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core"
import { ApolloServer } from "apollo-server-express"
import { serialize } from "cookie"
import Cors from "cors"
import Express, { Express as IExpress } from "express"
import Helmet from "helmet"
import { v4 as uuid } from "uuid"

import { createSchema } from "@/graphql"
import { router } from "@/router"

export type Context = {
  sessionUuid: string | null
  setSessionUuid: () => string
}

export const createApp = (): IExpress => {
  const app = Express()

  app.use(Helmet({ contentSecurityPolicy: false }))
  app.use(
    Cors({
      origin: true,
      credentials: true,
    }),
  )

  app.use(router)

  return app
}

export const connectApolloServer = async (app: IExpress) => {
  const server = new ApolloServer({
    schema: await createSchema(),
    introspection: true,
    context: ({ req, res }): Context => {
      let sessionUuid = req.headers.cookie?.match(/sessionUuid=([\dA-Za-z-]+);?/)?.[1]

      const setSessionUuid = () => {
        sessionUuid = uuid()

        res.header(
          "set-cookie",
          serialize("sessionUuid", sessionUuid, {
            maxAge: 60 * 60 * 24 * 30 * 12,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          }),
        )

        return sessionUuid
      }

      return {
        sessionUuid: sessionUuid ?? null,
        setSessionUuid,
      }
    },
    plugins: [ApolloServerPluginLandingPageDisabled()],
    formatError(error) {
      // Workaround for apollo adding two UserInputError details for some reason
      if (error.extensions?.code === "BAD_USER_INPUT") {
        const key = Object.keys(error.extensions.exception)?.[0]

        delete error.extensions[key]
      }

      return error
    },
  })

  await server.start()

  server.applyMiddleware({
    app,
    cors: {
      origin: [/.*/],
      credentials: true,
    },
  })

  return server
}
