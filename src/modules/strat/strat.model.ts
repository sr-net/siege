import { Field, Int, ObjectType, registerEnumType } from 'type-graphql'
import { Column, Entity, Index } from 'typeorm'

import { ExtendedEntity } from '@/modules/exented-entity'
import { Author } from '@/modules/strat/author.entity'
import { isNil, OptionalUuid } from '@/utils'

type StratConstructor = OptionalUuid<
  Pick<
    Strat,
    'uuid' | 'title' | 'description' | 'atk' | 'def' | 'gamemodes' | 'score'
  >
> & { author: Author }

export enum Gamemodes {
  Bombs = 'BOMBS',
  Hostage = 'HOSTAGE',
  Areas = 'CAPTURE_AREAS',
}

registerEnumType(Gamemodes, { name: 'Gamemodes' })

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
  @Field(() => [Gamemodes])
  public gamemodes: Gamemodes[]

  @Column({ type: 'int' })
  @Field(() => Int)
  public score: number

  constructor(options: StratConstructor) {
    super(options)

    if (isNil(options)) options = {} as any

    this.title = options.title
    this.description = options.description
    this.author = options.author
    this.atk = options.atk
    this.def = options.def
    this.gamemodes = options.gamemodes
    this.score = options.score
  }
}
