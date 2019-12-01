import { Arg, ID, Query, Resolver } from 'type-graphql'

import { Strat } from '@/modules/strat/strat.model'

@Resolver()
export class StratResolver {
  @Query(() => Strat, { nullable: true })
  public async strat(
    @Arg('uuid', () => ID, { nullable: true }) uuid: string,
    @Arg('shortId', () => ID, { nullable: true }) shortId: string,
  ): Promise<Strat | null> {
    return (
      (await Strat.findOne({
        where: [
          { uuid, submission: false },
          { shortId, submission: false },
        ],
      })) ?? null
    )
  }
}
