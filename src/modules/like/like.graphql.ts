import { FieldResolver } from "nexus"
import { dedent } from "ts-dedent"

import { dbClient } from "@/db"

const likedQuery = dedent`
  SELECT EXISTS (
    SELECT \`Like\`
    FILTER
      .strat.id = <uuid>$id
    AND
      .sessionId = <uuid>$sessionId
    AND
      .active = true
  );
`

export const resolveLiked: FieldResolver<"Strat", "liked"> = (strat, _, ctx) => {
  if (ctx.sessionUuid == null) return false

  return dbClient.queryRequiredSingle<boolean>(likedQuery, {
    id: strat.uuid,
    sessionId: ctx.sessionUuid,
  })
}
