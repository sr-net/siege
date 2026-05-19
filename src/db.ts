import { createClient } from "gel"

// ?. needed for tests
export const dbClient = createClient?.(process.env.GEL_DSN)
