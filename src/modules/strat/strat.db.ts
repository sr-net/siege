import { dedent } from "ts-dedent"

import type { types } from "#dbschema/interfaces.ts"
import type { TN } from "#r/graphql/scalars.ts"

export type DefaultStratObject = TN<"Strat"> & {
  uuid: types["default"]["Strat"]["id"]
} & Pick<
    types["default"]["Strat"],
    | "shortId"
    | "title"
    | "description"
    | "atk"
    | "def"
    | "gamemodes"
    | "score"
    | "submission"
    | "acceptedAt"
  > & {
    author: TN<"Author"> &
      Pick<types["default"]["Author"], "name" | "url"> & {
        type: types["default"]["Author"]["kind"]
      }
  }

export const stratGqlFields = dedent`
  __typename := "Strat",
  uuid := .id,
  shortId,
  title,
  description,
  atk,
  def,
  gamemodes,
  score,
  author: {
    __typename := "Author",
    name,
    type := .kind,
    url,
  },
  submission,
  acceptedAt,
`
