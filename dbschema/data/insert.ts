import { createClient } from "edgedb"

import likesData from "./likes_json.json"
import reportsData from "./reports_json.json"
import stratsData from "./strats_json.json"

const { likes } = likesData[0]
const { reports } = reportsData[0]
const { strats } = stratsData[0]

const client = createClient({ tlsSecurity: "insecure" })

const insertStratQuery = `
insert Strat {
  shortId := <int32>$shortId,
  title := <str>$title,
  description := <str>$description,
  atk := <bool>$atk,
  def := <bool>$def,
  gamemodes := <array<Gamemode>>$gamemode,
  score := <int32>$score,

  submission := <bool>$submission,
  acceptedAt := <optional datetime>$acceptedAt,

  createdAt := <datetime>$createdAt,

  author := (
    insert Author {
      name := <str>$authorName,
      kind := <AuthorKind>$authorKind,
      url := <optional str>$authorUrl,
      createdAt := <datetime>$createdAt,
    }
    unless conflict on .name
    else (
      select Author filter .name = <str>$authorName
    )
  ),
}
`

const insertLikeQuery = `
insert \`Like\` {
  sessionId := <uuid>$sessionId,
  active := <bool>$active,
  createdAt := <datetime>$createdAt,

  strat := (
    select Strat filter .shortId = <int32>$stratShortId
  ),
}
`

const addStratsAndAuthors = async () => {
  await Promise.all(
    strats.map(async ({ uuid, author, ...strat }) => {
      strat = {
        ...strat,
        createdAt: new Date(strat.createdAt) as any,
        acceptedAt: (strat.acceptedAt ? new Date(strat.acceptedAt) : null) as any,
      }

      return client.execute(insertStratQuery, {
        ...strat,
        authorName: author.name,
        authorKind: author.type,
        authorUrl: author.url,
      })
    }),
  )

  console.log("added strats and authors")
}

const map = Object.fromEntries(strats.map((strat) => [strat.uuid, strat.shortId]))

const addLikes = async () => {
  const existingLikes = new Set<`${string}:${string}`>()
  const extras = new Set<string>()

  await Promise.all(
    likes
      .filter(({ strat, sessionId }) => {
        if (existingLikes.has(`${strat}:${sessionId}`)) {
          extras.add(`${strat}:${sessionId}`)
          return false
        }

        existingLikes.add(`${strat}:${sessionId}`)
        return true
      })
      .map(async ({ strat, ...like }) => {
        like = {
          ...like,
          createdAt: new Date(like.createdAt) as any,
          stratShortId: map[strat],
        }

        return client.execute(insertLikeQuery, like)
      }),
  )

  console.log(`added likes, found ${extras.size} extras`)
}

const insertReportQuery = `
insert Report {
  sessionId := <uuid>$sessionId,
  message := <str>$message,
  createdAt := <datetime>$createdAt,

  strat := (
    select Strat filter .shortId = <int32>$stratShortId
  ),
}
`

const addReports = async () => {
  await Promise.all(
    reports.map(async ({ strat, ...report }) => {
      report = {
        ...report,
        createdAt: new Date(report.createdAt) as any,
        stratShortId: map[strat],
      }

      return client.execute(insertReportQuery, report)
    }),
  )

  console.log("added reports")
}

;(async () => {
  await addStratsAndAuthors()

  await addLikes()
  await addReports()
})()
