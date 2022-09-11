import Fastify, { FastifyReply, FastifyRequest } from "fastify"
import Mercurius from "mercurius"
import { v4 as uuid } from "uuid"

import Cookie from "@fastify/cookie"
import Cors from "@fastify/cors"
import Helmet from "@fastify/helmet"

import { config } from "@/config"
import { createSchema } from "@/graphql"

export type Context = {
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
    sessionUuid: sessionUuid ?? null,
    setSessionUuid,
  }
}

export const buildApp = async () => {
  const app = Fastify({
    genReqId: () => uuid(),
    logger: {
      transport: config.env !== "production" ? { target: "pino-pretty" } : undefined,
    },
  })

  await app.register(Cookie)

  await app.register(Cors, {
    origin: true,
  })

  await app.register(Helmet, {
    hsts: false,
    contentSecurityPolicy: false,
  })

  await app.register(Mercurius, {
    schema: await createSchema(),
    context: buildContext,

    jit: 8,
    queryDepth: 8,
  })

  return app
}
