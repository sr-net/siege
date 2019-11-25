import { Arg, ID, Int, Mutation, Query, Resolver } from 'type-graphql'

import { Boardgame, GAME_TYPE } from '@/modules/boardgame/boardgame.model'

@Resolver()
export class BoardgameResolver {
  @Query(() => Boardgame, { nullable: true })
  public async boardgame(
    @Arg('uuid', () => ID) uuid: string,
  ): Promise<Boardgame | null> {
    return (await Boardgame.findOne({ uuid })) ?? null
  }

  @Mutation(() => Boardgame)
  public async addBoardgame(
    @Arg('name') name: string,
    @Arg('maxPlayers', () => Int) maxPlayers: number,
    // Nullable
    @Arg('url', () => String, { nullable: true })
    url: string | null,
    @Arg('type', () => GAME_TYPE, { nullable: true })
    type: GAME_TYPE = GAME_TYPE.COMPETITIVE,
    @Arg('rulebook', () => String, { nullable: true })
    rulebook: string | null,
    @Arg('minPlayers', () => Int, { nullable: true })
    minPlayers: number = 1,
  ) {
    const boardgame = new Boardgame({
      type,
      name,
      url,
      rulebook,
      resultSchema: {} as any,
      minPlayers,
      maxPlayers,
    })

    return boardgame.save()
  }
}
