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
  );
`

export const resolveLiked: FieldResolver<"Strat", "liked"> = (strat, _, ctx) =>
  dbClient.queryRequiredSingle<boolean>(likedQuery, {
    id: strat.uuid,
    sessionId: ctx.sessionUuid,
  })
