import { Environment } from "@/constants"

type Config = {
  [key in Environment]: {
    env: Environment
    port: number
  }
}

const port = Number(process.env.PORT ?? "3000")

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
  },
}

export const config = _config[(process.env.NODE_ENV ?? "development") as Environment]
