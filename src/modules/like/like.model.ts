import { Column, Entity } from 'typeorm'

import { ExtendedEntity } from '@/modules/exented-entity'
import { OptionalUuid } from '@/utils'

type LikeConstructor = OptionalUuid<
  Pick<Like, 'uuid' | 'sessionUuid' | 'stratUuid'> &
    Partial<Pick<Like, 'active'>>
>

@Entity()
export class Like extends ExtendedEntity {
  @Column({ type: 'uuid' })
  sessionUuid: string

  @Column({ type: 'uuid' })
  stratUuid: string

  @Column()
  active: boolean

  constructor(options: LikeConstructor) {
    super(options)

    this.sessionUuid = options?.sessionUuid
    this.stratUuid = options?.stratUuid
    this.active = options?.active ?? true
  }
}
