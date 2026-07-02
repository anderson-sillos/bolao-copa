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

export type WorldCupGroupSummary = {
  id: string;
  name: string;
};

export type WorldCupTeamSummary = {
  id: string;
  name: string;
  countryCode: string;
  flagIconCode: string;
};

export type WorldCupTeam = WorldCupTeamSummary & {
  group: WorldCupGroupSummary | null;
};

export type WorldCupGroup = WorldCupGroupSummary & {
  teams: WorldCupTeamSummary[];
};

export type WorldCupGame = {
  id: string;
  phase: WorldCupGamePhase;
  gameTime: string;
  scoreA: number | null;
  scoreB: number | null;
  penaltyScoreA: number | null;
  penaltyScoreB: number | null;
  matchNumber: number | null;
  bracketOrder: number | null;
  teamASource: string | null;
  teamBSource: string | null;
  groupName: string | null;
  teamA: WorldCupTeamSummary | null;
  teamB: WorldCupTeamSummary | null;
};

export type WorldCupGamesByStage = {
  groupStage: WorldCupGame[];
  knockoutStage: WorldCupGame[];
};
