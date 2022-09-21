import Fastify, { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify"
import Mercurius from "mercurius"
import type { NexusGraphQLSchema } from "nexus/dist/definitions/_types"
import { v4 as uuid } from "uuid"

import Cookie from "@fastify/cookie"
import Cors from "@fastify/cors"
import Helmet from "@fastify/helmet"
import { captureException } from "@sentry/node"

import { config } from "@/config"

export type Context = {
  logger: FastifyBaseLogger
  sessionUuid: string | null
  setSessionUuid: () => string
}

const buildContext = (req: FastifyRequest, res: FastifyReply): Context => {
  let sessionUuid = req.headers.cookie?.match(/sessionUuid=([\dA-Za-z-]+);?/)?.[1]

  const setSessionUuid = () => {
    sessionUuid = uuid()

    void res.setCookie("sessionUuid", sessionUuid, {
      maxAge: 60 * 60 * 24 * 30 * 12 * 5,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return sessionUuid
  }

  return {
    logger: req.log,
    sessionUuid: sessionUuid ?? null,
    setSessionUuid,
  }
}

export const buildApp = async (schema: NexusGraphQLSchema) => {
  const app = Fastify({
    genReqId: () => uuid(),
    logger: {
      level: process.env.LOG_LEVEL ?? config.env === "development" ? "debug" : "info",
      transport: config.env !== "production" ? { target: "pino-pretty" } : undefined,
    },
  })

  await app.register(Cookie)

  await app.register(Cors, {
    credentials: true,
    origin: true,
  })

  await app.register(Helmet, {
    hsts: false,
    contentSecurityPolicy: false,
  })

  await app.register(Mercurius, {
    schema,
    context: buildContext,
    graphiql: true,

    jit: 8,
    queryDepth: 8,
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  app.graphql.addHook("onResolution", async (execution) => {
    if (execution.errors?.length ?? 0 !== 0) {
      for (const error of execution.errors!) {
        captureException(error)
      }
    }
  })

  return app
}
