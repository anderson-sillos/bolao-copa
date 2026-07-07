import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { clearAuthToken, getAuthToken } from '../../../auth/auth-storage';
import { Alert } from '../../../components/ui/Alert';
import {
  ApiError,
  getErrorMessage,
  getErrorMessages,
} from '../../../lib/api-errors';
import { listWorldCupGames } from '../../world-cup-data/world-cup-data-client';
import type { WorldCupGame } from '../../world-cup-data/world-cup-data-types';
import {
  createInitialBetFormState,
  createMatchBetMap,
  groupMatchBetGamesForDisplay,
  parseBetScore,
} from '../match-bets-helpers';
import { listMatchBets, saveMatchBet } from '../match-bets-client';
import type {
  MatchBet,
  MatchBetFormState,
  MatchBetSaveState,
} from '../match-bets-types';
import { MatchBetGameCard } from './MatchBetGameCard';

type PageState =
  'checking-session' | 'loading-data' | 'unauthenticated' | 'ready' | 'error';

export function MatchBetsPage() {
  const [pageState, setPageState] = useState<PageState>('checking-session');
  const [token, setToken] = useState<string | null>(null);
  const [games, setGames] = useState<WorldCupGame[]>([]);
  const [bets, setBets] = useState<MatchBet[]>([]);
  const [forms, setForms] = useState<Record<string, MatchBetFormState>>({});
  const [saveStates, setSaveStates] = useState<
    Record<string, MatchBetSaveState>
  >({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      setPageState('unauthenticated');
      return;
    }

    let isActive = true;
    setToken(storedToken);
    setPageState('loading-data');

    Promise.all([listWorldCupGames(storedToken), listMatchBets(storedToken)])
      .then(([loadedGames, loadedBets]) => {
        if (!isActive) {
          return;
        }

        setGames(loadedGames);
        setBets(loadedBets);
        setForms(createInitialBetFormState(loadedGames, loadedBets));
        setPageState('ready');
      })
      .catch(error => {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.statusCode === 401) {
          clearAuthToken();
          setToken(null);
          setPageState('unauthenticated');
          return;
        }

        setErrorMessages(getErrorMessages(error));
        setPageState('error');
      });

    return () => {
      isActive = false;
    };
  }, []);

  const betsByGameId = useMemo(() => createMatchBetMap(bets), [bets]);
  const groupedGames = useMemo(
    () => groupMatchBetGamesForDisplay(games),
    [games],
  );

  useEffect(() => {
    setExpandedPhases(
      new Set(
        groupedGames
          .filter(phaseGroup => phaseGroup.openGamesCount > 0)
          .map(phaseGroup => phaseGroup.phase),
      ),
    );
  }, [groupedGames]);

  function handleFormChange(
    gameId: string,
    field: keyof MatchBetFormState,
    value: string,
  ) {
    setForms(currentForms => ({
      ...currentForms,
      [gameId]: {
        ...(currentForms[gameId] ?? { scoreA: '', scoreB: '' }),
        [field]: value,
      },
    }));
    setSaveStates(currentStates => ({
      ...currentStates,
      [gameId]: 'idle',
    }));
    setSaveErrors(currentErrors => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[gameId];
      return nextErrors;
    });
  }

  function handleSave(gameId: string) {
    const currentToken = token;
    const formState = forms[gameId];
    const scoreA = parseBetScore(formState?.scoreA ?? '');
    const scoreB = parseBetScore(formState?.scoreB ?? '');

    if (!currentToken) {
      setPageState('unauthenticated');
      return;
    }

    if (scoreA === null || scoreB === null) {
      setSaveStates(currentStates => ({
        ...currentStates,
        [gameId]: 'error',
      }));
      setSaveErrors(currentErrors => ({
        ...currentErrors,
        [gameId]: 'Informe placares inteiros não negativos.',
      }));
      return;
    }

    setSaveStates(currentStates => ({
      ...currentStates,
      [gameId]: 'saving',
    }));

    saveMatchBet(currentToken, { gameId, scoreA, scoreB })
      .then(savedBet => {
        setBets(currentBets => {
          const nextBets = currentBets.filter(bet => bet.gameId !== gameId);
          return [...nextBets, savedBet];
        });
        setForms(currentForms => ({
          ...currentForms,
          [gameId]: {
            scoreA: String(savedBet.scoreA),
            scoreB: String(savedBet.scoreB),
          },
        }));
        setSaveStates(currentStates => ({
          ...currentStates,
          [gameId]: 'saved',
        }));
      })
      .catch(error => {
        if (error instanceof ApiError && error.statusCode === 401) {
          clearAuthToken();
          setToken(null);
          setPageState('unauthenticated');
          return;
        }

        setSaveStates(currentStates => ({
          ...currentStates,
          [gameId]: 'error',
        }));
        setSaveErrors(currentErrors => ({
          ...currentErrors,
          [gameId]: getErrorMessage(error),
        }));
      });
  }

  function togglePhase(phase: string) {
    setExpandedPhases(currentPhases => {
      const nextPhases = new Set(currentPhases);

      if (nextPhases.has(phase)) {
        nextPhases.delete(phase);
      } else {
        nextPhases.add(phase);
      }

      return nextPhases;
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">
                Meus palpites
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Preencha seus placares
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Salve seus palpites antes do início de cada jogo. Confrontos
                ainda indefinidos ficam bloqueados até a Copa avançar.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                href="/copa"
              >
                Ver Copa
              </Link>
              <Link
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                href="/"
              >
                Início
              </Link>
            </div>
          </div>

          {pageState === 'checking-session' && (
            <StatusCard message="Verificando sua sessão..." />
          )}

          {pageState === 'loading-data' && (
            <StatusCard message="Carregando jogos e palpites..." />
          )}

          {pageState === 'unauthenticated' && <UnauthenticatedState />}

          {pageState === 'error' && (
            <Alert
              messages={errorMessages}
              title="Não foi possível carregar seus palpites:"
            />
          )}

          {pageState === 'ready' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">
                  {betsByGameId.size} de {games.length} jogos com palpite salvo
                </p>
              </div>

              <div className="space-y-5">
                {groupedGames.map(phaseGroup => {
                  const isExpanded = expandedPhases.has(phaseGroup.phase);

                  return (
                    <section
                      key={phaseGroup.phase}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <button
                        aria-expanded={isExpanded}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        type="button"
                        onClick={() => togglePhase(phaseGroup.phase)}
                      >
                        <span>
                          <span className="block text-base font-bold text-slate-950">
                            {phaseGroup.label}
                          </span>
                          <span className="block text-sm font-medium text-slate-500">
                            {phaseGroup.totalGames} jogos
                            {phaseGroup.openGamesCount > 0
                              ? ` · ${phaseGroup.openGamesCount} abertos`
                              : ''}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-emerald-700">
                          {isExpanded ? 'Ocultar jogos' : 'Ver jogos'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="space-y-6 p-4 sm:p-5">
                          {phaseGroup.dateGroups.map(dateGroup => (
                            <section key={dateGroup.key} className="space-y-3">
                              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                                {dateGroup.label}
                              </h2>

                              <div className="grid gap-4">
                                {dateGroup.games.map(game => (
                                  <MatchBetGameCard
                                    key={game.id}
                                    errorMessage={saveErrors[game.id]}
                                    formState={
                                      forms[game.id] ?? {
                                        scoreA: '',
                                        scoreB: '',
                                      }
                                    }
                                    game={game}
                                    saveState={saveStates[game.id] ?? 'idle'}
                                    onChange={handleFormChange}
                                    onSubmit={handleSave}
                                  />
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

function UnauthenticatedState() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-xl font-bold">Acesso restrito</h2>
      <p className="mt-2 text-sm leading-6">
        Faça login para preencher e revisar seus palpites.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          href="/login"
        >
          Entrar
        </Link>
        <Link
          className="rounded-xl border border-amber-300 bg-white px-5 py-3 text-center font-semibold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-200"
          href="/register"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
