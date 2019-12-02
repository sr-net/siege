import { ArgsType, ClassType, Field, Int, ObjectType } from 'type-graphql'

export const PaginatedResponse = <TItem>(TItemClass: ClassType<TItem>) => {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    // here we use the runtime argument
    @Field(() => [TItemClass])
    // and here the generic type
    public items!: TItem[]

    @Field(() => Int)
    public lastPage!: number
  }

  return PaginatedResponseClass
}

@ArgsType()
export class PageArguments {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  public page!: number
}
