import { asEnumType } from "@gqloom/valibot"
import * as v from "valibot"

export const Author = v.object({
  __typename: v.literal("Author"),

  name: v.string(),
  type: v.pipe(
    v.picklist(["NAME", "YOUTUBE", "TWITCH", "REDDIT"]),
    asEnumType({ name: "AuthorType" }),
  ),
  url: v.nullish(v.pipe(v.string(), v.url())),
})
