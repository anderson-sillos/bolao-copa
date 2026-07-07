import { FormEvent } from 'react';

import { Button } from '../../../components/ui/Button';
import {
  formatGameDateTime,
  formatGamePhase,
} from '../../world-cup-data/world-cup-data-formatters';
import type {
  WorldCupGame,
  WorldCupTeamSummary,
} from '../../world-cup-data/world-cup-data-types';
import { FlagIcon } from '../../world-cup-data/components/FlagIcon';
import { adjustBetScore, getMatchBetEditStatus } from '../match-bets-helpers';
import type { MatchBetFormState, MatchBetSaveState } from '../match-bets-types';

type MatchBetGameCardProps = {
  errorMessage?: string;
  formState: MatchBetFormState;
  game: WorldCupGame;
  onChange: (
    gameId: string,
    field: keyof MatchBetFormState,
    value: string,
  ) => void;
  onSubmit: (gameId: string) => void;
  saveState: MatchBetSaveState;
};

export function MatchBetGameCard({
  errorMessage,
  formState,
  game,
  onChange,
  onSubmit,
  saveState,
}: MatchBetGameCardProps) {
  const editStatus = getMatchBetEditStatus(game);
  const isSaving = saveState === 'saving';
  const canSubmit =
    editStatus.canEdit &&
    formState.scoreA.trim() !== '' &&
    formState.scoreB.trim() !== '' &&
    !isSaving;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(game.id);
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {formatGamePhase(game.phase)} · {formatGameDateTime(game.gameTime)}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">
            Jogo {game.matchNumber ?? 'sem número'}
          </h3>
        </div>
        <span
          className={[
            'w-fit rounded-full px-3 py-1 text-xs font-bold',
            editStatus.canEdit
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500',
          ].join(' ')}
        >
          {editStatus.label}
        </span>
      </div>

      <form
        className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]"
        onSubmit={handleSubmit}
      >
        <TeamScoreField
          align="right"
          disabled={!editStatus.canEdit || isSaving}
          fieldLabel={game.teamA?.name ?? 'Time A'}
          team={game.teamA}
          value={formState.scoreA}
          onChange={value => onChange(game.id, 'scoreA', value)}
        />
        <span className="hidden self-center text-lg font-bold text-slate-400 xl:block">
          ×
        </span>
        <TeamScoreField
          align="left"
          disabled={!editStatus.canEdit || isSaving}
          fieldLabel={game.teamB?.name ?? 'Time B'}
          team={game.teamB}
          value={formState.scoreB}
          onChange={value => onChange(game.id, 'scoreB', value)}
        />
        <div className="flex flex-col justify-center gap-2">
          <Button disabled={!canSubmit} type="submit">
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <SaveStatus errorMessage={errorMessage} saveState={saveState} />
        </div>
      </form>
    </article>
  );
}

function TeamScoreField({
  align,
  disabled,
  fieldLabel,
  onChange,
  team,
  value,
}: {
  align: 'left' | 'right';
  disabled: boolean;
  fieldLabel: string;
  onChange: (value: string) => void;
  team: WorldCupTeamSummary | null;
  value: string;
}) {
  const input = (
    <ScoreInput
      disabled={disabled}
      label={fieldLabel}
      value={value}
      onChange={onChange}
    />
  );
  const teamLabel = <TeamLabel align={align} team={team} />;

  return (
    <div
      className={[
        'grid items-center gap-3',
        align === 'right'
          ? 'sm:grid-cols-[minmax(0,1fr)_9rem]'
          : 'sm:grid-cols-[9rem_minmax(0,1fr)]',
      ].join(' ')}
    >
      {align === 'right' ? (
        <>
          {teamLabel}
          {input}
        </>
      ) : (
        <>
          {input}
          {teamLabel}
        </>
      )}
    </div>
  );
}

function TeamLabel({
  align,
  team,
}: {
  align: 'left' | 'right';
  team: WorldCupTeamSummary | null;
}) {
  const alignment = align === 'right' ? 'text-right' : 'text-left';
  const direction = align === 'right' ? 'flex-row-reverse' : 'flex-row';

  if (!team) {
    return (
      <div className={`flex items-center ${alignment}`}>
        <p className="w-full text-sm font-semibold text-slate-500">A definir</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${direction}`}>
      <FlagIcon
        className="text-2xl"
        countryName={team.name}
        flagIconCode={team.flagIconCode}
      />
      <span className={alignment}>
        <span className="block text-sm font-bold text-slate-950">
          {team.name}
        </span>
        <span className="block text-xs font-semibold text-slate-500">
          {team.countryCode}
        </span>
      </span>
    </div>
  );
}

function ScoreInput({
  disabled,
  label,
  onChange,
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  function handleStep(delta: number) {
    onChange(adjustBetScore(value, delta));
  }

  return (
    <div className="grid min-w-20 grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
      <button
        aria-label={`Diminuir placar de ${label}`}
        className="border-r border-slate-200 text-lg font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none disabled:text-slate-300 disabled:hover:bg-transparent"
        disabled={disabled}
        type="button"
        onClick={() => handleStep(-1)}
      >
        -
      </button>
      <label className="block">
        <span className="sr-only">Placar de {label}</span>
        <input
          className="h-12 w-full border-0 bg-transparent text-center text-lg font-bold text-slate-950 outline-none transition disabled:text-slate-400"
          disabled={disabled}
          inputMode="numeric"
          min={0}
          pattern="[0-9]*"
          type="text"
          value={value}
          onChange={event => onChange(event.target.value)}
        />
      </label>
      <button
        aria-label={`Aumentar placar de ${label}`}
        className="border-l border-slate-200 text-lg font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none disabled:text-slate-300 disabled:hover:bg-transparent"
        disabled={disabled}
        type="button"
        onClick={() => handleStep(1)}
      >
        +
      </button>
    </div>
  );
}

function SaveStatus({
  errorMessage,
  saveState,
}: {
  errorMessage?: string;
  saveState: MatchBetSaveState;
}) {
  if (saveState === 'saved') {
    return (
      <p className="text-center text-xs font-semibold text-emerald-700">
        Palpite salvo
      </p>
    );
  }

  if (saveState === 'error' && errorMessage) {
    return (
      <p className="max-w-44 text-center text-xs font-semibold text-red-700">
        {errorMessage}
      </p>
    );
  }

  return <p className="text-center text-xs text-slate-400"> </p>;
}
