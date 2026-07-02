import { FlagIcon } from './FlagIcon';
import { formatGameDateTime } from '../world-cup-data-formatters';
import type {
  WorldCupGame,
  WorldCupTeamSummary,
} from '../world-cup-data-types';

type GameCardProps = {
  game: WorldCupGame;
  highlight?: boolean;
  metadataLabel?: string | null;
  variant?: 'default' | 'compact';
};

export function GameCard({
  game,
  highlight = false,
  metadataLabel,
  variant = 'default',
}: GameCardProps) {
  const isCompact = variant === 'compact';
  const badgeLabel =
    metadataLabel ?? (game.matchNumber ? String(game.matchNumber) : null);

  return (
    <article
      className={[
        'rounded-2xl border bg-white',
        highlight
          ? 'border-amber-300 shadow-lg shadow-amber-100 ring-2 ring-amber-200'
          : 'border-slate-200',
        isCompact ? 'p-4' : 'p-5',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {formatGameDateTime(game.gameTime)}
        </p>
        {badgeLabel && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
            {badgeLabel}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSlot
          align="right"
          source={game.teamASource}
          team={game.teamA}
          variant={variant}
        />
        <Score game={game} />
        <TeamSlot
          align="left"
          source={game.teamBSource}
          team={game.teamB}
          variant={variant}
        />
      </div>
    </article>
  );
}

function TeamSlot({
  align,
  team,
  source,
  variant,
}: {
  align: 'left' | 'right';
  team: WorldCupTeamSummary | null;
  source: string | null;
  variant: 'default' | 'compact';
}) {
  const alignment = align === 'right' ? 'text-right' : 'text-left';
  const rowDirection = align === 'right' ? 'flex-row-reverse' : 'flex-row';
  const isCompact = variant === 'compact';

  if (!team) {
    return (
      <div className={alignment}>
        {source ? (
          <p
            className="text-xs font-semibold text-slate-500"
            title={formatParticipantSource(source)}
          >
            {formatParticipantSource(source)}
          </p>
        ) : (
          <p className="text-sm font-semibold text-slate-500">A definir</p>
        )}
      </div>
    );
  }

  if (isCompact) {
    const title = source
      ? `${team.name} — ${formatParticipantSource(source)}`
      : team.name;

    return (
      <div className={`flex items-center gap-2 ${rowDirection}`} title={title}>
        <FlagIcon
          className="text-xl"
          countryName={team.name}
          flagIconCode={team.flagIconCode}
        />
        <span className={align === 'right' ? 'text-right' : 'text-left'}>
          <span className="block text-sm font-bold text-slate-950">
            {team.countryCode}
          </span>
          {source && (
            <span className="block text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400">
              {source}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={alignment}>
      <p className="text-sm font-semibold text-slate-950">{team.name}</p>
      <FlagIcon
        className="mt-1 text-xl"
        countryName={team.name}
        flagIconCode={team.flagIconCode}
      />
    </div>
  );
}

function formatParticipantSource(source: string): string {
  const match = source.match(/^([WL])(\d+)$/);

  if (!match) {
    return source;
  }

  const [, type, matchNumber] = match;
  return type === 'W'
    ? `Vencedor jogo ${matchNumber}`
    : `Perdedor jogo ${matchNumber}`;
}

function Score({ game }: { game: WorldCupGame }) {
  const hasScore =
    typeof game.scoreA === 'number' && typeof game.scoreB === 'number';
  const hasPenaltyScore =
    typeof game.penaltyScoreA === 'number' &&
    typeof game.penaltyScoreB === 'number';

  return (
    <div className="rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-bold text-slate-700">
      <p>{hasScore ? `${game.scoreA} × ${game.scoreB}` : '×'}</p>
      {hasPenaltyScore && (
        <p className="whitespace-nowrap text-[0.6rem] font-semibold leading-none text-slate-500">
          ({game.penaltyScoreA} × {game.penaltyScoreB})
        </p>
      )}
    </div>
  );
}
