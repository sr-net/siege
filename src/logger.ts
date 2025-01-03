import { pino } from "pino"
import PinoPretty from "pino-pretty"

import { config } from "@/config.ts"

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (config.env === "development" ? "debug" : "info"),
  },
  config.env !== "production" ? PinoPretty() : undefined!,
)
