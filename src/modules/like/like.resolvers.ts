import { Arg, Ctx, ID, Mutation, Resolver } from 'type-graphql'

import { Context } from '@/apollo'
import { Like } from '@/modules/like/like.model'
import { Strat } from '@/modules/strat/strat.model'
import { isNil } from '@/utils'

@Resolver()
export class LikeResolver {
  @Mutation(() => Strat, { nullable: true })
  public async likeStrat(
    @Arg('uuid', () => ID) uuid: string,
    @Ctx() ctx: Context,
  ): Promise<Strat | null> {
    const strat = await Strat.findOne({ uuid, submission: false })

    if (isNil(strat)) return null

    if (isNil(ctx.sessionUuid)) {
      ctx.setSessionUuid()
    }

    const like = new Like({
      sessionUuid: ctx.sessionUuid!,
      stratUuid: strat.uuid,
    })

    await like.save()

    strat.score++
    await strat.save()

    return strat
  }

  @Mutation(() => Strat, { nullable: true })
  public async unlikeStrat(
    @Arg('uuid', () => ID) uuid: string,
    @Ctx() ctx: Context,
  ): Promise<Strat | null> {
    const strat = await Strat.findOne({ uuid, submission: false })

    if (isNil(strat)) throw new Error('Strat does not exist!')

    if (isNil(ctx.sessionUuid)) {
      return null
    }

    const like = await Like.update(
      { stratUuid: uuid, sessionUuid: ctx.sessionUuid },
      { active: false },
    )

    if (like.affected ?? 0 < 1) return strat

    strat.score--
    await strat.save()

    return strat
  }
}
