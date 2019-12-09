import {
  Args,
  ArgsType,
  Field,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import { BaseEntity, FindOneOptions, In, Not } from 'typeorm'
import { ArrayMaxSize, IsUUID, Min } from 'class-validator'

import { PageArguments, PaginatedResponse } from '@/modules/common'
import { Strat } from '@/modules/strat/strat.model'
import { isNil } from '@/utils'

type StratFilter = FindOneOptions<Strat>['where']

@ArgsType()
class CommonStratArguments {
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

  @Field(() => [Int], {
    nullable: true,
    description: 'A list of Strats to be excluded from the result.',
  })
  @ArrayMaxSize(15)
  public excludeShortIds?: number[]

  public getFilters = (): StratFilter | StratFilter[] => {
    const commonFilters: StratFilter = {
      submission: false,
    }

    if (this.excludeShortIds?.length ?? 0 > 0) {
      commonFilters.shortId = Not(In(this.excludeShortIds ?? []))
    }

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

@ArgsType()
class SingleStratArguments extends CommonStratArguments {
  @Field({
    nullable: true,
    description:
      'Return a random Strat matching the arguments instead of the first best one.',
  })
  public random?: boolean
}

@ObjectType()
class StratPage extends PaginatedResponse(Strat) {}

@Resolver()
export class StratResolver {
  @Query(() => Strat, { nullable: true })
  public async strat(
    @Args() { random, getFilters }: SingleStratArguments,
  ): Promise<Strat | null> {
    if (random === true) {
      const uuids = await Strat.find<BaseEntity & Pick<Strat, 'uuid'>>({
        where: getFilters(),
        select: ['uuid'],
      })

      if (uuids.length < 1) return null

      return Strat.findOneOrFail({
        uuid: uuids[Math.floor(Math.random() * uuids.length)].uuid,
      })
    }

    return (await Strat.findOne({ where: getFilters() })) ?? null
  }

  @Query(() => StratPage)
  public async strats(
    @Args() { page }: PageArguments,
    @Args() { getFilters }: CommonStratArguments,
  ): Promise<StratPage> {
    const offset = 10 * Math.max(0, page - 1)

    const strats = await Strat.find({
      where: getFilters(),
      take: 10,
      skip: offset,
    })

    const total = await Strat.count({ where: getFilters() })

    return {
      items: strats,
      lastPage: Math.ceil(total / 10),
    }
  }
}
