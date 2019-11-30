// eslint-disable-next-line node/no-extraneous-import
import { EngineReportingOptions } from 'apollo-engine-reporting'
import { ConnectionOptions } from 'typeorm'
import { Environment } from '@/constants'

type Config = {
  [key in Environment]: {
    db: ConnectionOptions
    apolloEngine?: EngineReportingOptions<unknown>
  }
}

const defaultDbConfig = {
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASS,
  url: process.env.DATABASE_URL,
  database: 'postgres',

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
      migrationsRun: true,
      schema: 'srnet'
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
      apiKey: process.env.APOLLO_ENGINE_KEY,
    },
  },
}

export const config =
  _config[(process.env.NODE_ENV ?? 'development') as Environment]
