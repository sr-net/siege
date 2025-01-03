import type { Environment } from "@/constants.ts"

type Config = {
  [key in Environment]: {
    env: Environment
    port: number
  }
}

const port = Number(process.env.PORT ?? "3000")

const _config: Config = {
  development: {
    env: "development",
    port,
  },
  test: {
    env: "test",
    port,
  },
  production: {
    env: "production",
    port,
  },
}

export const config = _config[(process.env.NODE_ENV ?? "development") as Environment]
