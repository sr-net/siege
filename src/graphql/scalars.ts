import { GraphQLScalarType, Kind } from "graphql"
import * as v from "valibot"

export type TN<Str extends string> = { __typename: Str }

export const Uuid = v.pipe(v.string(), v.uuid())

export const PositiveInteger = v.pipe(v.number(), v.integer(), v.minValue(0))

export const GQLDateTime = new GraphQLScalarType({
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
