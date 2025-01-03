import { randomUUID } from "node:crypto"

import { graphqlServer } from "@hono/graphql-server"
import type { GraphQLSchema } from "graphql/type"
import { type Context, Hono, type MiddlewareHandler } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import type { Logger } from "pino"

import { config } from "@/config.ts"
import { logger } from "@/logger.ts"

export type Variables = {
  logger: Logger<string>
  sessionUuid: string | null
  setSessionUuid: () => string
}

export type GraphQLContext = Context<{ Variables: Variables }>

const buildContext: MiddlewareHandler<{ Variables: Variables }> = async (c, next) => {
  let sessionUuid = getCookie(c, "sessionUuid")

  const setSessionUuid = () => {
    sessionUuid = randomUUID()

    setCookie(c, "sessionUuid", sessionUuid, {
      maxAge: 60 * 60 * 24 * 30 * 12 * 5,
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
    })
    c.set("sessionUuid", sessionUuid)

    return sessionUuid
  }

  c.set("logger", logger.child({ sessionUuid }))
  c.set("sessionUuid", sessionUuid ?? null)
  c.set("setSessionUuid", setSessionUuid)

  await next()
}

export const buildApp = async (schema: GraphQLSchema) => {
  return new Hono<{ Variables: Variables }>()
    .use("*", buildContext)
    .use("*", async (c, next) => {
      const start = Date.now()
      c.var.logger.info(
        {
          method: c.req.method,
          path: c.req.path,
          headers: c.req.header(),
        },
        "req",
      )

      await next()

      c.var.logger.info(
        {
          status: c.res.status,
          ms: Date.now() - start,
        },
        "res",
      )
    })
    .use("*", cors({ credentials: true, origin: (origin) => origin }))
    .use("*", secureHeaders())
    .post("/graphql", graphqlServer({ schema }))
}
