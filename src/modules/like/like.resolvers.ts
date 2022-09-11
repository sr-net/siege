import { Arg, Ctx, ID, Mutation, Resolver } from "type-graphql"

import { Context } from "@/app"
import { Strat } from "@/modules/strat/strat.model"
import { isNil } from "@/utils"

@Resolver()
export class LikeResolver {
  @Mutation(() => Strat, { nullable: true })
  public async likeStrat(
    @Arg("uuid", () => ID) uuid: string,
    @Ctx() ctx: Context,
  ): Promise<Strat | null> {
    const strat = await Strat.findOne({ where: { uuid, submission: false } })

    if (isNil(strat)) return null

    if (isNil(ctx.sessionUuid)) {
      ctx.sessionUuid = await ctx.setSessionUuid()
    }

    return strat.like(ctx.sessionUuid)
  }

  @Mutation(() => Strat, { nullable: true })
  public async unlikeStrat(
    @Arg("uuid", () => ID) uuid: string,
    @Ctx() ctx: Context,
  ): Promise<Strat | null> {
    const strat = await Strat.findOne({ where: { uuid, submission: false } })

    if (isNil(strat)) throw new Error("Strat does not exist!")

    if (isNil(ctx.sessionUuid)) {
      return null
    }

    return strat.unlike(ctx.sessionUuid)
  }
}
