import type { DataSourceOptions } from "typeorm"

import type { NodeOptions } from "@sentry/node"

import { Environment } from "@/constants"

type Config = {
  [key in Environment]: {
    env: Environment
    port: number
    db: DataSourceOptions
    sentry?: NodeOptions
  }
}

const port = Number(process.env.PORT || "3000")

const defaultDbConfig: DataSourceOptions = {
  type: "postgres" as const,
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASS,
  database: process.env.DB_NAME ?? "postgres",
  schema: "public",
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,

  logging: false,
  entities: ["src/modules/**/*.model.ts"],
  migrations: ["migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
}

const _config: Config = {
  [Environment.DEVELOPMENT]: {
    env: Environment.DEVELOPMENT,
    port,
    db: {
      ...defaultDbConfig,
      synchronize: true,
      schema: process.env.DB_SCHEMA ?? "public",
    },
  },
  [Environment.TEST]: {
    env: Environment.TEST,
    port,
    db: {
      ...defaultDbConfig,
      schema: "srnet-tests",
      synchronize: true,
      dropSchema: true,
    },
  },
  [Environment.PRODUCTION]: {
    env: Environment.PRODUCTION,
    port,
    db: {
      ...defaultDbConfig,
      url: process.env.DATABASE_URL,
      migrationsRun: true,
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
      release: process.env.GIT_REV,
      environment: Environment.PRODUCTION,
    },
  },
}

export const config = _config[(process.env.NODE_ENV ?? "development") as Environment]
