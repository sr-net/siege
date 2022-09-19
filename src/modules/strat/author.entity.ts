import { enumType, objectType } from "nexus"

import { AuthorKind } from "@/edgedb"

const AuthorTypeEnum = enumType({
  name: "AuthorType",
  members: Object.values(AuthorKind),
})

export const Author = objectType({
  name: "Author",
  definition(t) {
    t.nonNull.string("name")
    t.nonNull.field("type", { type: AuthorTypeEnum })
    t.string("url")
  },
})
