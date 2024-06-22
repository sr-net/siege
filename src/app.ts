import { Hono, type MiddlewareHandler } from "hono"
import { cors } from "hono/cors"
import { getCookie, setCookie } from "hono/cookie"
import { secureHeaders } from "hono/secure-headers"
import type { NexusGraphQLSchema } from "nexus/dist/definitions/_types"
import type { Logger } from "pino"
import { v4 as uuid } from "uuid"
import { graphqlServer } from "@hono/graphql-server"

import { config } from "@/config"
import { logger } from "@/logger"

export type Variables = {
  logger: Logger<string>
  sessionUuid: string | null
  setSessionUuid: () => string
}

const buildContext: MiddlewareHandler<{ Variables: Variables }> = async (c, next) => {
  let sessionUuid = getCookie(c, "sessionUuid")

  const setSessionUuid = () => {
    sessionUuid = uuid()

    setCookie(c, "sessionUuid", sessionUuid, {
      maxAge: 60 * 60 * 24 * 30 * 12 * 5,
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
    })

    return sessionUuid
  }

  c.set("logger", logger.child({ sessionUuid }))
  c.set("sessionUuid", sessionUuid ?? null)
  c.set("setSessionUuid", setSessionUuid)

  await next()
}

export const buildApp = async (schema: NexusGraphQLSchema) => {
  return new Hono<{ Variables: Variables }>()
    .use("*", cors({ credentials: true, origin: (origin) => origin }))
    .use("*", secureHeaders())
    .post("/graphql", buildContext, graphqlServer({ schema }))
}
