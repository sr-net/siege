import { Column, Entity } from "typeorm"

import { ExtendedEntity } from "@/modules/exented-entity"
import { OptionalUuid } from "@/utils"

type LikeConstructor = OptionalUuid<
  Pick<Like, "uuid" | "sessionUuid" | "stratUuid"> & Partial<Pick<Like, "active">>
>

@Entity()
export class Like extends ExtendedEntity {
  @Column({ type: "uuid" })
  public sessionUuid!: string

  @Column({ type: "uuid" })
  public stratUuid!: string

  @Column()
  public active!: boolean

  public static from(options: LikeConstructor): Like {
    const like = new Like()

    like.addUuid(options)
    like.sessionUuid = options?.sessionUuid
    like.stratUuid = options?.stratUuid
    like.active = options?.active ?? true

    return like
  }
}
