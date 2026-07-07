import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from '../entities/bet.entity';
import { Game } from '../entities/game.entity';
import { SaveMatchBetDto, UpdateMatchBetDto } from './dto/save-match-bet.dto';
import { MatchBetDto, toMatchBet } from './match-bet.dto';

@Injectable()
export class MatchBetsService {
  constructor(
    @InjectRepository(Bet)
    private readonly bets: Repository<Bet>,
    @InjectRepository(Game)
    private readonly games: Repository<Game>,
  ) {}

  async listUserBets(userId: string): Promise<MatchBetDto[]> {
    const bets = await this.createUserBetsQuery(userId).getMany();
    return bets.map(toMatchBet);
  }

  async getUserBetForGame(
    userId: string,
    gameId: string,
  ): Promise<MatchBetDto | null> {
    const bet = await this.createUserBetsQuery(userId)
      .andWhere('bet.gameId = :gameId', { gameId })
      .getOne();

    return bet ? toMatchBet(bet) : null;
  }

  async saveUserBet(
    userId: string,
    input: SaveMatchBetDto,
  ): Promise<MatchBetDto> {
    return this.upsertUserBet(userId, input.gameId, input.scoreA, input.scoreB);
  }

  async updateUserBet(
    userId: string,
    gameId: string,
    input: UpdateMatchBetDto,
  ): Promise<MatchBetDto> {
    return this.upsertUserBet(userId, gameId, input.scoreA, input.scoreB);
  }

  private async upsertUserBet(
    userId: string,
    gameId: string,
    scoreA: number,
    scoreB: number,
  ): Promise<MatchBetDto> {
    const game = await this.findGameOrFail(gameId);
    this.ensureGameAcceptsBets(game);

    const existingBet = await this.bets.findOne({
      where: {
        userId,
        gameId,
      },
    });

    const bet =
      existingBet ??
      this.bets.create({
        userId,
        gameId,
      });

    bet.scoreA = scoreA;
    bet.scoreB = scoreB;

    const savedBet = await this.bets.save(bet);
    const completeBet = await this.createUserBetsQuery(userId)
      .andWhere('bet.id = :betId', { betId: savedBet.id })
      .getOneOrFail();

    return toMatchBet(completeBet);
  }

  private async findGameOrFail(gameId: string): Promise<Game> {
    const game = await this.games.findOne({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado');
    }

    return game;
  }

  private ensureGameAcceptsBets(game: Game): void {
    if (!game.teamAId || !game.teamBId) {
      throw new BadRequestException(
        'Palpites liberados apenas para jogos definidos',
      );
    }

    if (game.gameTime.getTime() <= Date.now()) {
      throw new BadRequestException('Palpites encerrados para este jogo');
    }
  }

  private createUserBetsQuery(userId: string) {
    return this.bets
      .createQueryBuilder('bet')
      .innerJoinAndSelect('bet.game', 'game')
      .leftJoinAndSelect('game.teamA', 'teamA')
      .leftJoinAndSelect('game.teamB', 'teamB')
      .leftJoinAndSelect('teamA.group', 'teamAGroup')
      .leftJoinAndSelect('teamB.group', 'teamBGroup')
      .where('bet.userId = :userId', { userId })
      .orderBy('game.gameTime', 'ASC')
      .addOrderBy('game.bracketOrder', 'ASC', 'NULLS LAST')
      .addOrderBy('game.matchNumber', 'ASC')
      .addOrderBy('game.id', 'ASC');
  }
}
