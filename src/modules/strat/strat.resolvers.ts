import { Arg, ID, Int, Query, Resolver } from 'type-graphql'

import { Strat } from '@/modules/strat/strat.model'

@Resolver()
export class StratResolver {
  @Query(() => Strat, { nullable: true })
  public async strat(
    @Arg('uuid', () => ID, { nullable: true })
    uuid?: string,
    @Arg('shortId', () => ID, { nullable: true })
    shortId?: string,
  ): Promise<Strat | null> {
    return (await Strat.findOne({ where: [{ uuid }, { shortId }] })) ?? null
  }

  @Query(() => [Strat])
  public async strats(
    @Arg('page', () => Int, { nullable: true, defaultValue: 0 })
    page: number,
  ): Promise<Strat[]> {
    const strats = await Strat.find({ take: 10, skip: 10 * page })

    return strats
  }
}
