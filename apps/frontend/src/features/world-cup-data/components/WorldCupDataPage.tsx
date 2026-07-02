import Link from 'next/link';
import { useEffect, useState } from 'react';

import { clearAuthToken, getAuthToken } from '../../../auth/auth-storage';
import { Alert } from '../../../components/ui/Alert';
import { ApiError, getErrorMessages } from '../../../lib/api-errors';
import {
  listWorldCupGames,
  listWorldCupGroups,
} from '../world-cup-data-client';
import type { WorldCupGame, WorldCupGroup } from '../world-cup-data-types';
import { splitWorldCupGamesByStage } from '../world-cup-data-formatters';
import { GroupList } from './GroupList';
import { GroupStageSchedule } from './GroupStageSchedule';
import { KnockoutBracket } from './KnockoutBracket';

type PageState =
  | 'checking-session'
  | 'loading-data'
  | 'unauthenticated'
  | 'ready'
  | 'error';

export function WorldCupDataPage() {
  const [pageState, setPageState] = useState<PageState>('checking-session');
  const [groups, setGroups] = useState<WorldCupGroup[]>([]);
  const [games, setGames] = useState<WorldCupGame[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setPageState('unauthenticated');
      return;
    }

    let isActive = true;
    setPageState('loading-data');

    Promise.all([listWorldCupGroups(token), listWorldCupGames(token)])
      .then(([loadedGroups, loadedGames]) => {
        if (!isActive) {
          return;
        }

        setGroups(loadedGroups);
        setGames(loadedGames);
        setPageState('ready');
      })
      .catch(error => {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.statusCode === 401) {
          clearAuthToken();
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

  const { groupStage, knockoutStage } = splitWorldCupGamesByStage(games);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">
                Dados da Copa
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Agenda, grupos e seleções
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Consulte os dados base da Copa 2026 que serão usados nas
                próximas funcionalidades do bolão.
              </p>
            </div>

            <Link
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              href="/"
            >
              Voltar para início
            </Link>
          </div>

          {pageState === 'checking-session' && (
            <StatusCard message="Verificando sua sessão..." />
          )}

          {pageState === 'loading-data' && (
            <StatusCard message="Carregando dados da Copa..." />
          )}

          {pageState === 'unauthenticated' && <UnauthenticatedState />}

          {pageState === 'error' && (
            <Alert
              messages={errorMessages}
              title="Não foi possível carregar os dados da Copa:"
            />
          )}

          {pageState === 'ready' && (
            <div className="space-y-8">
              <GroupList groups={groups} />
              <GroupStageSchedule games={groupStage} />
              <KnockoutBracket games={knockoutStage} />
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
        Faça login para acessar grupos, seleções e agenda dos jogos.
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
