import { dedent } from "ts-dedent"

export const stratGqlFields = dedent`
  uuid := .id,
  shortId,
  title,
  description,
  atk,
  def,
  gamemodes,
  score,
  author: {
    name,
    type := .kind,
    url,
  },
`
