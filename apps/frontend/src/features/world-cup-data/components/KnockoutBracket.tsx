import { useEffect, useRef, useState } from 'react';
import { GameCard } from './GameCard';
import {
  BRACKET_GAME_SLOT_HEIGHT_REM,
  formatGamePhase,
  getBracketGameTopRem,
  groupGamesByPhase,
  orderKnockoutGamesForBracket,
} from '../world-cup-data-formatters';
import type { WorldCupGame, WorldCupGamePhase } from '../world-cup-data-types';

const knockoutPhaseOrder: WorldCupGamePhase[] = [
  'segunda_fase',
  'oitavas',
  'quartas',
  'semifinal',
];

const finalPhaseGroup: WorldCupGamePhase[] = ['final', 'terceiro_lugar'];
const basePhaseActivationRatio = 0.2;
const maxBasePhaseActivationOffsetPx = 180;
const decisionGameGapRem = BRACKET_GAME_SLOT_HEIGHT_REM + 2.5;

type KnockoutBracketProps = {
  games: WorldCupGame[];
};

export function KnockoutBracket({ games }: KnockoutBracketProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const phaseColumnRefs = useRef<
    Partial<Record<WorldCupGamePhase, HTMLElement | null>>
  >({});
  const previousBasePhaseRef = useRef<WorldCupGamePhase | null>(null);
  const gamesByPhase = groupGamesByPhase(games);
  const orderedGamesByPhase = orderKnockoutGamesForBracket(gamesByPhase);
  const phases = knockoutPhaseOrder.filter(
    phase => (gamesByPhase[phase]?.length ?? 0) > 0,
  );
  const finalPhases = finalPhaseGroup.filter(
    phase => (gamesByPhase[phase]?.length ?? 0) > 0,
  );
  const [activeBasePhase, setActiveBasePhase] =
    useState<WorldCupGamePhase>('segunda_fase');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const basePhase = phases.includes(activeBasePhase)
    ? activeBasePhase
    : (phases[0] ?? 'segunda_fase');
  const baseGameCount =
    orderedGamesByPhase[basePhase]?.length ??
    orderedGamesByPhase.segunda_fase?.length ??
    0;

  function updateActiveBasePhase() {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const activationOffset = Math.min(
      scrollContainer.clientWidth * basePhaseActivationRatio,
      maxBasePhaseActivationOffsetPx,
    );
    const activationBoundary = scrollContainer.scrollLeft + activationOffset;
    const visiblePhase =
      [...phases].reverse().find(phase => {
        const column = phaseColumnRefs.current[phase];
        return column && column.offsetLeft <= activationBoundary;
      }) ?? phases[phases.length - 1];

    if (visiblePhase && visiblePhase !== activeBasePhase) {
      setActiveBasePhase(visiblePhase);
    }

    setCanScrollLeft(scrollContainer.scrollLeft > 0);
    setCanScrollRight(
      scrollContainer.scrollLeft + scrollContainer.clientWidth <
        scrollContainer.scrollWidth - 1,
    );
  }

  function scrollBracket(direction: 'left' | 'right') {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const currentScrollLeft = scrollContainer.scrollLeft;
    const phaseColumns = phases
      .map(phase => phaseColumnRefs.current[phase])
      .filter((column): column is HTMLElement => Boolean(column));
    const targetColumn =
      direction === 'left'
        ? [...phaseColumns]
            .reverse()
            .find(column => column.offsetLeft < currentScrollLeft - 8)
        : phaseColumns.find(
            column => column.offsetLeft > currentScrollLeft + 8,
          );
    const fallbackOffset =
      phaseColumns[1]?.offsetLeft ??
      phaseColumns[0]?.offsetWidth ??
      scrollContainer.clientWidth * 0.8;

    scrollContainer.scrollTo({
      behavior: 'smooth',
      left:
        targetColumn?.offsetLeft ??
        (direction === 'left'
          ? currentScrollLeft - fallbackOffset
          : currentScrollLeft + fallbackOffset),
    });
  }

  function keepBracketGamesVisible() {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const sectionTop = section.getBoundingClientRect().top;

    if (sectionTop < 0) {
      window.scrollTo({
        behavior: 'smooth',
        top: window.scrollY + sectionTop - 12,
      });
    }
  }

  useEffect(() => {
    updateActiveBasePhase();
  });

  useEffect(() => {
    if (previousBasePhaseRef.current === null) {
      previousBasePhaseRef.current = basePhase;
      return;
    }

    if (previousBasePhaseRef.current !== basePhase) {
      keepBracketGamesVisible();
      previousBasePhaseRef.current = basePhase;
    }
  }, [basePhase]);

  return (
    <section className="relative" ref={sectionRef}>
      <div className="mb-4 pr-28">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Chaves de confronto
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Fases eliminatórias agrupadas por etapa. Quando o participante ainda
            não estiver definido, a chave indica o vencedor ou perdedor do jogo
            de origem.
          </p>
        </div>
      </div>
      <div className="sticky top-3 z-10 mb-3 flex justify-end gap-2">
        <ScrollButton
          ariaLabel="Rolar chaves para a esquerda"
          disabled={!canScrollLeft}
          onClick={() => scrollBracket('left')}
        >
          ←
        </ScrollButton>
        <ScrollButton
          ariaLabel="Rolar chaves para a direita"
          disabled={!canScrollRight}
          onClick={() => scrollBracket('right')}
        >
          →
        </ScrollButton>
      </div>

      <div
        className="overflow-x-auto pb-3"
        onScroll={updateActiveBasePhase}
        ref={scrollContainerRef}
      >
        <div className="flex min-w-max gap-4">
          {phases.map(phase => (
            <PhaseColumn
              baseGameCount={baseGameCount}
              games={orderedGamesByPhase[phase] ?? []}
              key={phase}
              phase={phase}
              refCallback={element => {
                phaseColumnRefs.current[phase] = element;
              }}
            />
          ))}
          {finalPhases.length > 0 && (
            <FinalPhaseColumn
              baseGameCount={baseGameCount}
              finalGames={orderedGamesByPhase.final ?? []}
              thirdPlaceGames={orderedGamesByPhase.terceiro_lugar ?? []}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function PhaseColumn({
  baseGameCount,
  games,
  phase,
  refCallback,
}: {
  baseGameCount: number;
  games: WorldCupGame[];
  phase: WorldCupGamePhase;
  refCallback: (element: HTMLElement | null) => void;
}) {
  return (
    <article
      className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-5"
      ref={refCallback}
    >
      <AlignedPhaseBlock
        baseGameCount={baseGameCount}
        games={games}
        phase={phase}
      />
    </article>
  );
}

function FinalPhaseColumn({
  baseGameCount,
  finalGames,
  thirdPlaceGames,
}: {
  baseGameCount: number;
  finalGames: WorldCupGame[];
  thirdPlaceGames: WorldCupGame[];
}) {
  const finalGame = finalGames[0];
  const thirdPlaceGame = thirdPlaceGames[0];
  const finalTopRem = finalGame
    ? getBracketGameTopRem(
        finalGame,
        finalGames.length || 1,
        baseGameCount || 1,
      )
    : 0;
  const columnHeightRem = Math.max(
    baseGameCount * BRACKET_GAME_SLOT_HEIGHT_REM,
    finalTopRem + decisionGameGapRem + BRACKET_GAME_SLOT_HEIGHT_REM,
  );

  return (
    <article className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-bold text-slate-950">Decisão</h3>
      <div
        className="relative mt-4"
        style={{
          height: `${columnHeightRem}rem`,
        }}
      >
        {finalGame && (
          <div
            className="absolute left-0 right-0"
            style={{
              top: `${finalTopRem}rem`,
            }}
          >
            <PhaseTitle phase="final" />
            <GameCard game={finalGame} highlight variant="compact" />
          </div>
        )}
        {thirdPlaceGame && (
          <div
            className="absolute left-0 right-0"
            style={{
              top: `${finalTopRem + decisionGameGapRem}rem`,
            }}
          >
            <PhaseTitle phase="terceiro_lugar" />
            <GameCard game={thirdPlaceGame} variant="compact" />
          </div>
        )}
      </div>
    </article>
  );
}

function ScrollButton({
  ariaLabel,
  children,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-lg font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function AlignedPhaseBlock({
  baseGameCount,
  games,
  phase,
}: {
  baseGameCount: number;
  games: WorldCupGame[];
  phase: WorldCupGamePhase;
}) {
  const columnHeightRem =
    Math.max(games.length, baseGameCount) * BRACKET_GAME_SLOT_HEIGHT_REM;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-950">
        {formatGamePhase(phase)}
      </h3>
      <div
        className="relative mt-4"
        style={{
          height: `${columnHeightRem}rem`,
        }}
      >
        {games.map(game => (
          <div
            className="absolute left-0 right-0"
            key={game.id}
            style={{
              top: `${getBracketGameTopRem(
                game,
                games.length,
                baseGameCount || games.length,
              )}rem`,
            }}
          >
            <GameCard game={game} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PhaseTitle({ phase }: { phase: WorldCupGamePhase }) {
  return (
    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
      {formatGamePhase(phase)}
    </p>
  );
}
