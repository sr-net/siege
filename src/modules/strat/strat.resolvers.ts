import { Arg, ID, Query, Resolver } from 'type-graphql'

import { Strat } from '@/modules/strat/strat.model'

@Resolver()
export class StratResolver {
  @Query(() => Strat, { nullable: true })
  public async strat(
    @Arg('uuid', () => ID) uuid: string,
  ): Promise<Strat | null> {
    return (await Strat.findOne({ uuid, submission: false })) ?? null
  }
}
