import { Ctx, Field, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Column, Entity, Index } from 'typeorm'

import { Context } from '@/apollo'
import { ExtendedEntity } from '@/modules/exented-entity'
import { Like } from '@/modules/like/like.model'
import { Author } from '@/modules/strat/author.entity'
import { isNil, OptionalUuid } from '@/utils'

type StratConstructor = OptionalUuid<
  Pick<
    Strat,
    | 'uuid'
    | 'shortId'
    | 'title'
    | 'description'
    | 'atk'
    | 'def'
    | 'gamemodes'
    | 'score'
    | 'submission'
    | 'acceptedAt'
  >
> & { author: Author }

export enum Gamemode {
  Bombs = 'BOMBS',
  Hostage = 'HOSTAGE',
  Areas = 'CAPTURE_AREAS',
}

registerEnumType(Gamemode, { name: 'Gamemode' })

@Entity()
@ObjectType()
export class Strat extends ExtendedEntity {
  @Column({ unique: true })
  @Index()
  @Field(() => Int)
  public shortId: number

  @Column({ length: 40 })
  @Index()
  @Field()
  public title: string

  @Column({ length: 450 })
  @Field()
  public description: string

  @Column(() => Author)
  @Field(() => Author)
  public author: Author

  @Column()
  @Field()
  public atk: boolean

  @Column()
  @Field()
  public def: boolean

  @Column({ type: 'simple-array' })
  @Field(() => [Gamemode])
  public gamemodes: Gamemode[]

  @Column({ type: 'int' })
  @Field(() => Int)
  public score: number

  @Column()
  @Field()
  public submission: boolean

  @Column({ nullable: true })
  @Field({ nullable: true })
  public acceptedAt?: Date

  @Field(() => Boolean)
  public async liked(@Ctx() ctx: Context): Promise<boolean> {
    if (isNil(ctx.sessionUuid)) {
      return false
    }

    const count = await Like.count({
      stratUuid: this.uuid,
      sessionUuid: ctx.sessionUuid,
      active: true,
    })

    return count === 1
  }

  constructor(options: StratConstructor) {
    super(options)

    this.shortId = options?.shortId
    this.title = options?.title
    this.description = options?.description
    this.author = options?.author
    this.atk = options?.atk
    this.def = options?.def
    this.gamemodes = options?.gamemodes
    this.score = options?.score
    this.submission = options?.submission
    this.acceptedAt = options?.acceptedAt
  }

  public async like(sessionUuid: string): Promise<Strat> {
    const options = {
      sessionUuid: sessionUuid,
      stratUuid: this.uuid,
    }

    let like = await Like.findOne(options)

    if (!isNil(like)) {
      if (like.active) return this

      like.active = true
    } else {
      like = new Like(options)
    }

    await like.save()

    this.score++
    await this.save()

    return this
  }

  public async unlike(sessionUuid: string): Promise<Strat> {
    const like = await Like.update(
      { stratUuid: this.uuid, sessionUuid: sessionUuid, active: true },
      { active: false },
    )

    if ((like.affected ?? 0) < 1) return this

    this.score--
    await this.save()

    return this
  }
}
