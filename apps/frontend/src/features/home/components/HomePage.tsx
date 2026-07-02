import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getAuthenticatedUser, PublicUser } from '../../../auth/auth-client';
import { clearAuthToken, getAuthToken } from '../../../auth/auth-storage';
import { Button } from '../../../components/ui/Button';

type AuthenticationState = 'checking' | 'authenticated' | 'anonymous';

export function HomePage() {
  const [authenticationState, setAuthenticationState] =
    useState<AuthenticationState>('checking');
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setAuthenticationState('anonymous');
      return;
    }

    let isActive = true;

    getAuthenticatedUser(token)
      .then(profile => {
        if (!isActive) {
          return;
        }

        setUser(profile);
        setAuthenticationState('authenticated');
      })
      .catch(() => {
        clearAuthToken();

        if (!isActive) {
          return;
        }

        setUser(null);
        setAuthenticationState('anonymous');
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    setAuthenticationState('anonymous');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">
            Bolão da Copa 2026
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Palpites, ranking e aquela resenha saudável de Copa.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Crie sua conta, acompanhe seus palpites e dispute a liderança do
            bolão com amigos, família ou equipe.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            {authenticationState === 'checking' && (
              <p className="text-sm font-medium text-slate-600">
                Verificando sua sessão...
              </p>
            )}

            {authenticationState === 'anonymous' && (
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Entre para começar
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Acesse sua conta ou faça seu cadastro para participar do Bolão
                  da Copa 2026.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                    href="/register"
                  >
                    Criar conta
                  </Link>
                  <Link
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                    href="/login"
                  >
                    Entrar
                  </Link>
                </div>
              </div>
            )}

            {authenticationState === 'authenticated' && user && (
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Olá, {user.name}!
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está autenticado como{' '}
                  <span className="font-semibold text-slate-800">
                    {user.email}
                  </span>
                  .
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                    href="/copa"
                  >
                    Ver dados da Copa
                  </Link>
                  <Button onClick={handleLogout} variant="secondary">
                    Sair
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
