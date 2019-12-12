// eslint-disable-next-line node/no-extraneous-import
import { EngineReportingOptions } from 'apollo-engine-reporting'
import { ConnectionOptions } from 'typeorm'
import dotenv from 'dotenv'
import { Environment } from '@/constants'

type Config = {
  [key in Environment]: {
    db: ConnectionOptions
    apolloEngine?: EngineReportingOptions<unknown>
  }
}

dotenv.config()

const defaultDbConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME ?? 'postgres',
  schema: 'public',
  url: process.env.DATABASE_URL,

  logging: false,
  entities: ['src/modules/**/*.model.ts'],
  migrations: ['migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  cli: {
    entitiesDir: 'src/modules',
    migrationsDir: 'migrations',
    subscribersDir: 'src/subscribers',
  },
}

const _config: Config = {
  [Environment.DEVELOPMENT]: {
    db: {
      ...defaultDbConfig,
      synchronize: true,
      schema: process.env.DB_SCHEMA ?? 'srnet'
    },
    apolloEngine: {
      schemaTag: process.env.NODE_ENV ?? 'production',
      apiKey: process.env.ENGINE_API_KEY,
    },
  },
  [Environment.TEST]: {
    db: {
      ...defaultDbConfig,
      schema: 'srnet-tests',
      synchronize: true,
      dropSchema: true,
    },
  },
  [Environment.PRODUCTION]: {
    db: {
      ...defaultDbConfig,
      url: process.env.DATABASE_URL,
      migrationsRun: true,
    },
    apolloEngine: {
      schemaTag: process.env.NODE_ENV ?? 'production',
      apiKey: process.env.ENGINE_API_KEY,
    },
  },
}
export const config =
  _config[(process.env.NODE_ENV ?? 'development') as Environment]
