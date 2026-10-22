import { describe, it, type TestContext } from "node:test"

import { getFilters } from "#/modules/strat/strat.graphql.ts"

describe("getFilters", () => {
  it("no args returns only submission exclusion", (t: TestContext) => {
    t.assert.deepStrictEqual(getFilters({}), {
      // oxlint-disable-next-line no-undefined
      args: undefined,
      filters: ".submission = false",
    })
  })

  it("uuid only filters for id", (t: TestContext) => {
    t.assert.deepStrictEqual(getFilters({ uuid: "uuid" }), {
      args: {
        uuid: "uuid",
      },
      filters: ".id = <uuid>$uuid",
    })
  })

  it("uuid only filters for shortId", (t: TestContext) => {
    t.assert.deepStrictEqual(getFilters({ shortId: 123 }), {
      args: {
        shortId: 123,
      },
      filters: ".shortId = <int32>$shortId",
    })
  })

  it("multiple filters are chained together", (t: TestContext) => {
    t.assert.deepStrictEqual(getFilters({ gamemode: "BOMBS", atk: true }), {
      args: {
        atk: true,
        def: false,
        gamemode: "BOMBS",
      },
      filters:
        ".submission = false and .atk = <bool>$atk and .def = <bool>$def and contains(.gamemodes, <Gamemode>$gamemode)",
    })
  })
})
