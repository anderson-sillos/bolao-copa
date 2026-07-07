import { Bet } from '../entities/bet.entity';
import {
  toWorldCupGame,
  WorldCupGameDto,
} from '../world-cup-data/world-cup-data.dto';

export type MatchBetDto = {
  id: string;
  gameId: string;
  scoreA: number;
  scoreB: number;
  createdAt: Date;
  updatedAt: Date;
  game: WorldCupGameDto;
};

export type MatchBetLookupDto = {
  bet: MatchBetDto | null;
};

export function toMatchBet(bet: Bet): MatchBetDto {
  return {
    id: bet.id,
    gameId: bet.gameId,
    scoreA: bet.scoreA,
    scoreB: bet.scoreB,
    createdAt: bet.createdAt,
    updatedAt: bet.updatedAt,
    game: toWorldCupGame(bet.game),
  };
}
