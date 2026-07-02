import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { Group } from '../entities/group.entity';
import { Team } from '../entities/team.entity';
import {
  isWorldCupGamePhase,
  toWorldCupGame,
  toWorldCupGroup,
  toWorldCupTeam,
  WorldCupGameDto,
  WorldCupGroupDto,
  WorldCupTeamDto,
} from './world-cup-data.dto';

@Injectable()
export class WorldCupDataService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    @InjectRepository(Team)
    private readonly teams: Repository<Team>,
    @InjectRepository(Game)
    private readonly games: Repository<Game>,
  ) {}

  async listGroups(): Promise<WorldCupGroupDto[]> {
    const groups = await this.groups.find({
      relations: {
        teams: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return groups.map(toWorldCupGroup);
  }

  async listTeams(): Promise<WorldCupTeamDto[]> {
    const teams = await this.teams.find({
      relations: {
        group: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return teams.map(toWorldCupTeam);
  }

  async listGames(phase?: string): Promise<WorldCupGameDto[]> {
    if (phase && !isWorldCupGamePhase(phase)) {
      throw new BadRequestException('Fase inválida');
    }

    const query = this.games
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.teamA', 'teamA')
      .leftJoinAndSelect('game.teamB', 'teamB')
      .leftJoinAndSelect('teamA.group', 'teamAGroup')
      .leftJoinAndSelect('teamB.group', 'teamBGroup');

    if (phase) {
      query.where('game.phase = :phase', { phase });
    }

    if (phase && phase !== 'fase_de_grupos') {
      query
        .orderBy('game.bracketOrder', 'ASC', 'NULLS LAST')
        .addOrderBy('game.matchNumber', 'ASC')
        .addOrderBy('game.gameTime', 'ASC')
        .addOrderBy('game.id', 'ASC');
    } else {
      query
        .orderBy('game.gameTime', 'ASC')
        .addOrderBy('game.bracketOrder', 'ASC', 'NULLS LAST')
        .addOrderBy('game.matchNumber', 'ASC')
        .addOrderBy('game.id', 'ASC');
    }

    const games = await query.getMany();
    return games.map(toWorldCupGame);
  }
}
