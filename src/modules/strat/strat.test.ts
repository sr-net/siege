import { describe, expect, it } from "vitest"

import { getFilters } from "#r/modules/strat/strat.graphql.ts"

describe("getFilters", () => {
  it("no args returns only submission exclusion", () => {
    expect(getFilters({})).toMatchInlineSnapshot(`
      {
        "args": undefined,
        "filters": ".submission = false",
      }
    `)
  })

  it("uuid only filters for id", () => {
    expect(getFilters({ uuid: "uuid" })).toMatchInlineSnapshot(`
      {
        "args": {
          "uuid": "uuid",
        },
        "filters": ".id = <uuid>$uuid",
      }
    `)
  })

  it("uuid only filters for shortId", () => {
    expect(getFilters({ shortId: 123 })).toMatchInlineSnapshot(`
      {
        "args": {
          "shortId": 123,
        },
        "filters": ".shortId = <int32>$shortId",
      }
    `)
  })

  it("multiple filters are chained together", () => {
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
