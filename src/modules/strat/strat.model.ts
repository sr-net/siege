import { Ctx, Field, Int, ObjectType, registerEnumType } from "type-graphql"
import { Column, Entity, Index } from "typeorm"

import { Context } from "@/app"
import { ExtendedEntity } from "@/modules/exented-entity"
import { Like } from "@/modules/like/like.model"
import { Author } from "@/modules/strat/author.entity"
import { isNil, OptionalUuid } from "@/utils"

type StratConstructor = OptionalUuid<
  Pick<
    Strat,
    | "uuid"
    | "shortId"
    | "title"
    | "description"
    | "atk"
    | "def"
    | "gamemodes"
    | "score"
    | "submission"
    | "acceptedAt"
  >
> & { author: Author }

export enum Gamemode {
  Bombs = "BOMBS",
  Hostage = "HOSTAGE",
  Areas = "CAPTURE_AREAS",
}

registerEnumType(Gamemode, { name: "Gamemode" })

@Entity()
@ObjectType()
export class Strat extends ExtendedEntity {
  @Column({ unique: true })
  @Index()
  @Field(() => Int)
  public shortId!: number

  @Column({ length: 40 })
  @Index()
  @Field()
  public title!: string

  @Column({ length: 450 })
  @Field()
  public description!: string

  @Column(() => Author)
  @Field(() => Author)
  public author!: Author

  @Column()
  @Field()
  public atk!: boolean

  @Column()
  @Field()
  public def!: boolean

  @Column({ type: "simple-array" })
  @Field(() => [Gamemode])
  public gamemodes!: Gamemode[]

  @Column({ type: "int" })
  @Field(() => Int)
  public score!: number

  @Column()
  @Field()
  public submission!: boolean

  @Column({ nullable: true })
  @Field({ nullable: true })
  public acceptedAt?: Date

  @Field(() => Boolean)
  public async liked(@Ctx() ctx: Context): Promise<boolean> {
    if (isNil(ctx.sessionUuid)) {
      return false
    }

    const count = await Like.count({
      where: {
        stratUuid: this.uuid,
        sessionUuid: ctx.sessionUuid,
        active: true,
      },
    })

    return count === 1
  }

  public static from(options: StratConstructor): Strat {
    const strat = new Strat()

    strat.addUuid(options)
    strat.shortId = options?.shortId
    strat.title = options?.title
    strat.description = options?.description
    strat.author = options?.author
    strat.atk = options?.atk
    strat.def = options?.def
    strat.gamemodes = options?.gamemodes
    strat.score = options?.score
    strat.submission = options?.submission
    strat.acceptedAt = options?.acceptedAt

    return strat
  }

  public async like(sessionUuid: string): Promise<Strat> {
    const options = {
      sessionUuid,
      stratUuid: this.uuid,
    }

    let like = await Like.findOne({
      where: options,
    })

    if (!isNil(like)) {
      if (like.active) return this

      like.active = true
    } else {
      like = Like.from(options)
    }

    await like.save()

    this.score++
    await this.save()

    return this
  }

  public async unlike(sessionUuid: string): Promise<Strat> {
    const like = await Like.update(
      { stratUuid: this.uuid, sessionUuid, active: true },
      { active: false },
    )

    if ((like.affected ?? 0) < 1) return this

    this.score--
    await this.save()

    return this
  }
}
