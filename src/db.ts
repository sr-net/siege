import { createClient } from "edgedb"

// ?. needed for tests
export const dbClient = createClient?.()
