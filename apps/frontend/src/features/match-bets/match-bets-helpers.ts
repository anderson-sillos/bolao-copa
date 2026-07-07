import { formatGamePhase } from '../world-cup-data/world-cup-data-formatters';
import type {
  WorldCupGame,
  WorldCupGamePhase,
} from '../world-cup-data/world-cup-data-types';
import type { MatchBet, MatchBetFormState } from './match-bets-types';

export type MatchBetEditStatus = {
  canEdit: boolean;
  label: string;
};

export type MatchBetGameDateGroup = {
  key: string;
  label: string;
  games: WorldCupGame[];
};

export type MatchBetGamePhaseGroup = {
  phase: WorldCupGamePhase;
  label: string;
  openGamesCount: number;
  totalGames: number;
  dateGroups: MatchBetGameDateGroup[];
};

const matchBetPhaseOrder: WorldCupGamePhase[] = [
  'fase_de_grupos',
  'segunda_fase',
  'oitavas',
  'quartas',
  'semifinal',
  'terceiro_lugar',
  'final',
];

const dateGroupLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
});

export function createMatchBetMap(bets: MatchBet[]): Map<string, MatchBet> {
  return new Map(bets.map(bet => [bet.gameId, bet]));
}

export function createInitialBetFormState(
  games: WorldCupGame[],
  bets: MatchBet[],
): Record<string, MatchBetFormState> {
  const betsByGameId = createMatchBetMap(bets);

  return Object.fromEntries(
    games.map(game => {
      const bet = betsByGameId.get(game.id);
      return [
        game.id,
        {
          scoreA: bet ? String(bet.scoreA) : '',
          scoreB: bet ? String(bet.scoreB) : '',
        },
      ];
    }),
  );
}

export function getMatchBetEditStatus(
  game: WorldCupGame,
  now = new Date(),
): MatchBetEditStatus {
  if (!game.teamA || !game.teamB) {
    return {
      canEdit: false,
      label: 'Confronto a definir',
    };
  }

  if (new Date(game.gameTime).getTime() <= now.getTime()) {
    return {
      canEdit: false,
      label: 'Palpites encerrados',
    };
  }

  return {
    canEdit: true,
    label: 'Aberto para palpites',
  };
}

export function parseBetScore(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  return Number(value);
}

export function adjustBetScore(value: string, delta: number): string {
  const currentScore = parseBetScore(value);

  if (currentScore === null) {
    return '0';
  }

  return String(Math.max(0, currentScore + delta));
}

export function groupMatchBetGamesForDisplay(
  games: WorldCupGame[],
  now = new Date(),
): MatchBetGamePhaseGroup[] {
  const gamesByPhase = new Map<WorldCupGamePhase, WorldCupGame[]>();

  for (const game of games) {
    gamesByPhase.set(game.phase, [
      ...(gamesByPhase.get(game.phase) ?? []),
      game,
    ]);
  }

  return matchBetPhaseOrder.flatMap(phase => {
    const phaseGames = gamesByPhase.get(phase);

    if (!phaseGames || phaseGames.length === 0) {
      return [];
    }

    const dateGroupsByKey = new Map<string, MatchBetGameDateGroup>();

    for (const game of sortGamesForMatchBets(phaseGames)) {
      const date = new Date(game.gameTime);
      const key = getDateGroupKey(date);
      const group = dateGroupsByKey.get(key) ?? {
        key,
        label: dateGroupLabelFormatter.format(date),
        games: [],
      };

      dateGroupsByKey.set(key, {
        ...group,
        games: [...group.games, game],
      });
    }

    return [
      {
        phase,
        label: formatGamePhase(phase),
        openGamesCount: phaseGames.filter(
          game => getMatchBetEditStatus(game, now).canEdit,
        ).length,
        totalGames: phaseGames.length,
        dateGroups: [...dateGroupsByKey.values()],
      },
    ];
  });
}

function sortGamesForMatchBets(games: WorldCupGame[]): WorldCupGame[] {
  return [...games].sort((gameA, gameB) => {
    const dateComparison = gameA.gameTime.localeCompare(gameB.gameTime);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return (
      (gameA.matchNumber ?? Number.MAX_SAFE_INTEGER) -
      (gameB.matchNumber ?? Number.MAX_SAFE_INTEGER)
    );
  });
}

function getDateGroupKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
