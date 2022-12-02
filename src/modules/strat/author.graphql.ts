import { enumType, objectType } from "nexus"

const AuthorTypeEnum = enumType({
  name: "AuthorType",
  members: ["NAME", "YOUTUBE", "TWITCH", "REDDIT"],
})

export const Author = objectType({
  name: "Author",
  definition(t) {
    t.nonNull.string("name")
    t.nonNull.field("type", { type: AuthorTypeEnum })
    t.string("url")
  },
})
