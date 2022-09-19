import { Kind } from "graphql"
import { scalarType } from "nexus"

export const DateTime = scalarType({
  name: "DateTime",
  description:
    "The javascript `Date` as string. Type represents date and time as the ISO Date string.",

  serialize(input) {
    if (input instanceof Date) {
      return input.toISOString()
    }

    console.error("Failed to serialize DateTime.")
  },
  parseValue(value) {
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value)
    }

    console.error("Failed to parse DateTime.")
  },
  parseLiteral(node) {
    if (node.kind === Kind.STRING || node.kind === Kind.INT) {
      return new Date(node.value)
    }
  },
})
