import { Ctx, Field, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Column, Entity, Index } from 'typeorm'

import { Context } from '@/apollo'
import { ExtendedEntity } from '@/modules/exented-entity'
import { Author } from '@/modules/strat/author.entity'
import { Like } from '@/modules/like/like.model'
import { isNil, OptionalUuid } from '@/utils'

type StratConstructor = OptionalUuid<
  Pick<
    Strat,
    | 'uuid'
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
  @Column({ length: 20 })
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

    return (await Like.count({ stratUuid: this.uuid })) === 1
  }

  constructor(options: StratConstructor) {
    super(options)

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
}
