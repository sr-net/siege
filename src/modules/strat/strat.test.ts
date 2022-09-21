import { describe, expect, test } from "vitest"

import { getFilters } from "@/modules/strat/strat.graphql"

describe("getFilters", () => {
  test("no args returns only submission exclusion", () => {
    expect(getFilters({})).toMatchInlineSnapshot(`
      {
        "args": undefined,
        "filters": ".submission = false",
      }
    `)
  })

  test("uuid only filters for id", () => {
    expect(getFilters({ uuid: "uuid" })).toMatchInlineSnapshot(`
      {
        "args": {
          "uuid": "uuid",
        },
        "filters": ".id = <uuid>$uuid",
      }
    `)
  })

  test("uuid only filters for shortId", () => {
    expect(getFilters({ shortId: 123 })).toMatchInlineSnapshot(`
      {
        "args": {
          "shortId": 123,
        },
        "filters": ".shortId = <int32>$shortId",
      }
    `)
  })

  test("multiple filters are chained together", () => {
    expect(getFilters({ gamemode: "BOMBS", atk: true })).toMatchInlineSnapshot(
      `
        {
          "args": {
            "atk": true,
            "def": false,
            "gamemode": "BOMBS",
          },
          "filters": ".submission = false and .atk = <bool>$atk and .def = <bool>$def and contains(.gamemodes, <Gamemode>$gamemode)",
        }
      `,
    )
  })
})
