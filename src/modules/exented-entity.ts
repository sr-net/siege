import { Field, ID, ObjectType } from 'type-graphql'
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import uuid from 'uuid/v4'

@ObjectType({ isAbstract: true })
export abstract class ExtendedEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid', unique: true })
  @Field(() => ID)
  public readonly uuid: string

  @CreateDateColumn()
  public readonly createdAt!: Date
  @UpdateDateColumn()
  public readonly updatedAt!: Date

  protected constructor(options: { uuid?: string }) {
    super()

    this.uuid = options?.uuid ?? uuid()
  }

  public shouldExistError<E extends typeof ExtendedEntity>(
    entity: E,
    uuid: string,
  ) {
    return new Error(
      `${this.toLoggable()} owner ${entity.toLoggable(uuid)} does not exist!`,
    )
  }

  public toLoggable(json?: boolean) {
    if (json) {
      return JSON.stringify(this, null, 2)
    }

    return `[${this.constructor.name}:${this.uuid}]`
  }

  public static toLoggable(uuid: string) {
    return `[${this.constructor.name}:${uuid}]`
  }
}
