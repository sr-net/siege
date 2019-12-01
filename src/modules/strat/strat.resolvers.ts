import { Args, ArgsType, Field, ID, Int, Query, Resolver } from 'type-graphql'
import { FindOneOptions } from 'typeorm'
import { IsUUID, Min } from 'class-validator'

import { Strat } from '@/modules/strat/strat.model'
import { isNil } from '@/utils'

type StratFilter = FindOneOptions<Strat>['where']

@ArgsType()
class PageArguments {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  public page!: number
}

@ArgsType()
class StratArguments {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  public uuid?: string

  @Field(() => Int, { nullable: true })
  @Min(1)
  public shortId?: string

  @Field({
    nullable: true,
    description:
      'Set to `true` to filter for Strats that work on attack. Setting to `false` does nothing.',
  })
  public atk?: boolean

  @Field({
    nullable: true,
    description:
      'Set to `true` to filter for Strats that work on defense. Setting to `false` does nothing.',
  })
  public def?: boolean

  @Field(() => [ID], {
    nullable: true,
    description: 'A list of Strats to be excluded from the result.',
  })
  public excludeShortIds?: number[]

  public getFilters = (): StratFilter | StratFilter[] => {
    const commonFilters: StratFilter = {}

    if (this.atk === true || this.def === true) {
      commonFilters.atk = this.atk ?? false
      commonFilters.def = this.def ?? false
    }

    if (!isNil(this.uuid)) {
      return [{ ...commonFilters, uuid: this.uuid }]
    }

    if (!isNil(this.shortId)) {
      return [{ ...commonFilters, shortId: this.shortId }]
    }

    return commonFilters
  }
}

@Resolver()
export class StratResolver {
  @Query(() => Strat, { nullable: true })
  public async strat(
    @Args() { getFilters }: StratArguments,
  ): Promise<Strat | null> {
    return (await Strat.findOne({ where: getFilters() })) ?? null
  }

  @Query(() => [Strat])
  public async strats(
    @Args() { page }: PageArguments,
    @Args() { getFilters }: StratArguments,
  ): Promise<Strat[]> {
    const strats = await Strat.find({
      where: getFilters(),
      take: 10,
      skip: 10 * Math.min(0, page - 1),
    })

    return strats
  }
}
