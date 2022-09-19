import e from "@/edgedb"
import { getFilters } from "@/modules/strat/strat.graphql"

describe("getFilters", () => {
  test("no args returns correctly", () => {
    expect(
      e
        .select(e.Strat, (strat) => ({
          filters: getFilters(strat as any, { page: null }),
        }))
        .toEdgeQL(),
    )
  })
})
