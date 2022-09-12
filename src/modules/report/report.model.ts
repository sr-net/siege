import { Column, Entity } from "typeorm"

import { ExtendedEntity } from "@/modules/exented-entity"
import { OptionalUuid } from "@/utils"

type LikeConstructor = OptionalUuid<
  Pick<Report, "uuid" | "sessionUuid" | "stratUuid" | "message">
>

@Entity()
export class Report extends ExtendedEntity {
  @Column({ type: "uuid" })
  public sessionUuid!: string

  @Column({ type: "uuid" })
  public stratUuid!: string

  @Column()
  public message!: string

  public static from(options: LikeConstructor): Report {
    const report = new Report()

    report.addUuid(options)
    report.sessionUuid = options?.sessionUuid
    report.stratUuid = options?.stratUuid
    report.message = options?.message

    return report
  }
}
