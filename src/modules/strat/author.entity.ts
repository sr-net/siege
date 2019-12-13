import { Field, ObjectType, registerEnumType } from 'type-graphql'
import { Column, Index } from 'typeorm'

export enum AuthorType {
  Name = 'NAME',
  YouTube = 'YOUTUBE',
  Twitch = 'TWITCH',
  Reddit = 'REDDIT',
}

registerEnumType(AuthorType, { name: 'AuthorType' })

@ObjectType()
export class Author {
  @Column({ type: 'enum', enum: AuthorType })
  @Field(() => AuthorType)
  public type!: AuthorType

  @Column()
  @Index()
  @Field()
  public name!: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  public url?: string
}
