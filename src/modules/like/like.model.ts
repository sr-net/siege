import { Column, Entity } from "typeorm"

@Entity()
export class Like {
  @Column({ type: "uuid" })
  public sessionUuid!: string

  @Column({ type: "uuid" })
  public stratUuid!: string

  @Column()
  public active!: boolean

  public static from(options: any): Like {
    const like = new Like()

    like.sessionUuid = options?.sessionUuid
    like.stratUuid = options?.stratUuid
    like.active = options?.active ?? true

    return like
  }
}
