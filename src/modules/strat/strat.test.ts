import { getFilters } from "@/modules/strat/strat.graphql"

describe("getFilters", () => {
  test("no args returns only submission exclusion", () => {
    expect(getFilters({ page: null })).toMatchInlineSnapshot('".submission = false"')
  })

  test("uuid only filters for id", () => {
    expect(getFilters({ uuid: "uuid", page: null })).toMatchInlineSnapshot(
      '".id = $uuid"',
    )
  })

  test("uuid only filters for shortId", () => {
    expect(getFilters({ shortId: 123, page: null })).toMatchInlineSnapshot(
      '".shortId = $shortId"',
    )
  })

  test("multiple filters are chained together", () => {
    expect(
      getFilters({ gamemode: "BOMBS", atk: true, page: null }),
    ).toMatchInlineSnapshot(
      '".submission = false and .atk = true and .def = true and contains(.gamemodes, <Gamemode>$gamemode)"',
    )
  })
})
