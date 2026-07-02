import type {
  WorldCupGame,
  WorldCupGamePhase,
  WorldCupGamesByStage,
} from './world-cup-data-types';

const phaseLabels: Record<WorldCupGamePhase, string> = {
  fase_de_grupos: 'Fase de grupos',
  segunda_fase: 'Segunda fase',
  oitavas: 'Oitavas de final',
  quartas: 'Quartas de final',
  semifinal: 'Semifinal',
  terceiro_lugar: 'Disputa de terceiro lugar',
  final: 'Final',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const BRACKET_GAME_SLOT_HEIGHT_REM = 7.5;

export function formatGamePhase(phase: WorldCupGamePhase): string {
  return phaseLabels[phase];
}

export function formatGameDateTime(gameTime: string): string {
  return dateTimeFormatter.format(new Date(gameTime));
}

export function isGroupStageGame(game: WorldCupGame): boolean {
  return game.phase === 'fase_de_grupos';
}

export function isKnockoutStageGame(game: WorldCupGame): boolean {
  return !isGroupStageGame(game);
}

export function splitWorldCupGamesByStage(
  games: WorldCupGame[],
): WorldCupGamesByStage {
  return games.reduce<WorldCupGamesByStage>(
    (stages, game) => {
      if (isGroupStageGame(game)) {
        stages.groupStage.push(game);
      } else {
        stages.knockoutStage.push(game);
      }

      return stages;
    },
    {
      groupStage: [],
      knockoutStage: [],
    },
  );
}

export function groupGamesByPhase(
  games: WorldCupGame[],
): Partial<Record<WorldCupGamePhase, WorldCupGame[]>> {
  return games.reduce<Partial<Record<WorldCupGamePhase, WorldCupGame[]>>>(
    (groups, game) => {
      groups[game.phase] = [...(groups[game.phase] ?? []), game];
      return groups;
    },
    {},
  );
}

export function orderKnockoutGamesForBracket(
  gamesByPhase: Partial<Record<WorldCupGamePhase, WorldCupGame[]>>,
): Partial<Record<WorldCupGamePhase, WorldCupGame[]>> {
  return Object.fromEntries(
    Object.entries(gamesByPhase).map(([phase, games]) => [
      phase,
      sortGamesByBracketOrder(games),
    ]),
  );
}

export function sortGamesByMatchNumber(games: WorldCupGame[]): WorldCupGame[] {
  return [...games].sort(compareGamesByMatchNumber);
}

export function getBracketGameTopRem(
  game: WorldCupGame,
  phaseGameCount: number,
  baseGameCount: number,
): number {
  if (phaseGameCount <= 0 || baseGameCount <= 0) {
    return 0;
  }

  const bracketOrder = game.bracketOrder ?? game.matchNumber ?? 1;
  const groupSize = baseGameCount / phaseGameCount;

  return (
    ((bracketOrder - 1) * groupSize + (groupSize - 1) / 2) *
    BRACKET_GAME_SLOT_HEIGHT_REM
  );
}

function sortGamesByBracketOrder(games: WorldCupGame[]): WorldCupGame[] {
  return [...games].sort((gameA, gameB) => {
    const bracketOrderA = gameA.bracketOrder ?? Number.MAX_SAFE_INTEGER;
    const bracketOrderB = gameB.bracketOrder ?? Number.MAX_SAFE_INTEGER;

    if (bracketOrderA !== bracketOrderB) {
      return bracketOrderA - bracketOrderB;
    }

    return compareGamesByMatchNumber(gameA, gameB);
  });
}

function compareGamesByMatchNumber(
  gameA: WorldCupGame,
  gameB: WorldCupGame,
): number {
  const matchNumberA = gameA.matchNumber ?? Number.MAX_SAFE_INTEGER;
  const matchNumberB = gameB.matchNumber ?? Number.MAX_SAFE_INTEGER;

  if (matchNumberA !== matchNumberB) {
    return matchNumberA - matchNumberB;
  }

  return gameA.gameTime.localeCompare(gameB.gameTime);
}
