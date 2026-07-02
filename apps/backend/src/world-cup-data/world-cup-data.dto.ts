import { Game } from '../entities/game.entity';
import { Group } from '../entities/group.entity';
import { Team } from '../entities/team.entity';

export const worldCupGamePhases = [
  'fase_de_grupos',
  'segunda_fase',
  'oitavas',
  'quartas',
  'semifinal',
  'terceiro_lugar',
  'final',
] as const;

export type WorldCupGamePhase = (typeof worldCupGamePhases)[number];

export type WorldCupGroupDto = {
  id: string;
  name: string;
  teams: WorldCupTeamSummaryDto[];
};

export type WorldCupTeamDto = WorldCupTeamSummaryDto & {
  group: WorldCupGroupSummaryDto | null;
};

export type WorldCupTeamSummaryDto = {
  id: string;
  name: string;
  countryCode: string;
  flagIconCode: string;
};

export type WorldCupGroupSummaryDto = {
  id: string;
  name: string;
};

export type WorldCupGameDto = {
  id: string;
  phase: WorldCupGamePhase;
  gameTime: Date;
  scoreA: number | null;
  scoreB: number | null;
  penaltyScoreA: number | null;
  penaltyScoreB: number | null;
  matchNumber: number | null;
  bracketOrder: number | null;
  teamASource: string | null;
  teamBSource: string | null;
  groupName: string | null;
  teamA: WorldCupTeamSummaryDto | null;
  teamB: WorldCupTeamSummaryDto | null;
};

export function isWorldCupGamePhase(phase: string): phase is WorldCupGamePhase {
  return worldCupGamePhases.includes(phase as WorldCupGamePhase);
}

export function toWorldCupGroup(group: Group): WorldCupGroupDto {
  return {
    id: group.id,
    name: group.name,
    teams: [...(group.teams ?? [])]
      .sort((teamA, teamB) => teamA.name.localeCompare(teamB.name, 'pt-BR'))
      .map(toWorldCupTeamSummary),
  };
}

export function toWorldCupTeam(team: Team): WorldCupTeamDto {
  return {
    ...toWorldCupTeamSummary(team),
    group: team.group
      ? {
          id: team.group.id,
          name: team.group.name,
        }
      : null,
  };
}

export function toWorldCupGame(game: Game): WorldCupGameDto {
  return {
    id: game.id,
    phase: game.phase as WorldCupGamePhase,
    gameTime: game.gameTime,
    scoreA: game.scoreA,
    scoreB: game.scoreB,
    penaltyScoreA: game.penaltyScoreA,
    penaltyScoreB: game.penaltyScoreB,
    matchNumber: game.matchNumber,
    bracketOrder: game.bracketOrder,
    teamASource: game.teamASource,
    teamBSource: game.teamBSource,
    groupName: game.phase === 'fase_de_grupos' ? getGameGroupName(game) : null,
    teamA: game.teamA ? toWorldCupTeamSummary(game.teamA) : null,
    teamB: game.teamB ? toWorldCupTeamSummary(game.teamB) : null,
  };
}

function getGameGroupName(game: Game): string | null {
  return game.teamA?.group?.name ?? game.teamB?.group?.name ?? null;
}

function toWorldCupTeamSummary(team: Team): WorldCupTeamSummaryDto {
  return {
    id: team.id,
    name: team.name,
    countryCode: team.countryCode,
    flagIconCode: team.flagIconCode,
  };
}
