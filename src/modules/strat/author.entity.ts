import { Column, Index } from 'typeorm'
import { Field, ObjectType, registerEnumType } from 'type-graphql'

export enum AuthorType {
  Name = 'NAME',
  YouTube = 'YOUTUBE',
  Twitch = 'TWITCH',
  Reddit = 'REDDIT',
}

registerEnumType(AuthorType, { name: 'AuthorType' })

@ObjectType()
export class Author {
  @Column({ length: 15 })
  @Field(() => AuthorType)
  public authorType!: AuthorType

  @Column()
  @Index()
  @Field()
  public name!: string

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  public url!: string | null
}
