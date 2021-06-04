import { Column, Entity } from "typeorm"

import { ExtendedEntity } from "@/modules/exented-entity"
import { OptionalUuid } from "@/utils"

type LikeConstructor = OptionalUuid<
  Pick<Report, "uuid" | "sessionUuid" | "stratUuid" | "message">
>

@Entity()
export class Report extends ExtendedEntity {
  @Column({ type: "uuid" })
  public sessionUuid: string

  @Column({ type: "uuid" })
  public stratUuid: string

  @Column()
  public message: string

  constructor(options: LikeConstructor) {
    super(options)

    this.sessionUuid = options?.sessionUuid
    this.stratUuid = options?.stratUuid
    this.message = options?.message
  }
}
