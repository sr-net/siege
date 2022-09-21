import type { NodeOptions } from "@sentry/node"

import { Environment } from "@/constants"

type Config = {
  [key in Environment]: {
    env: Environment
    port: number
    sentry?: NodeOptions
  }
}

const port = Number(process.env.PORT || "3000")

const _config: Config = {
  [Environment.DEVELOPMENT]: {
    env: Environment.DEVELOPMENT,
    port,
  },
  [Environment.TEST]: {
    env: Environment.TEST,
    port,
  },
  [Environment.PRODUCTION]: {
    env: Environment.PRODUCTION,
    port,
    sentry: {
      dsn: process.env.SENTRY_DSN,
      release: process.env.GIT_REV,
      environment: Environment.PRODUCTION,
    },
  },
}

export const config = _config[(process.env.NODE_ENV ?? "development") as Environment]
