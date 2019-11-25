import { Query, Resolver } from 'type-graphql'

import { Strat } from '@/modules/strat/strat.model'

@Resolver()
export class SubmissionResolver {
  @Query(() => Strat, { nullable: true })
  public async submission(): Promise<Strat | null> {
    return (await Strat.findOne({ submission: true })) ?? null
  }
}
