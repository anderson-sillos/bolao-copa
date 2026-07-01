import Link from 'next/link';
import { ReactNode } from 'react';

type AuthShellProps = {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

export function AuthShell({
  children,
  description,
  eyebrow = 'Bolão da Copa 2026',
  title,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[1fr_28rem]">
          <div className="bg-gradient-to-br from-emerald-700 via-sky-700 to-blue-950 p-8 text-white sm:p-10 lg:p-12">
            <Link
              className="inline-flex rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
              href="/"
            >
              Voltar para o início
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">
                {eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-sky-50">
                {description}
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
