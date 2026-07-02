import { FlagIcon } from './FlagIcon';
import type { WorldCupGroup } from '../world-cup-data-types';

type GroupListProps = {
  groups: WorldCupGroup[];
};

export function GroupList({ groups }: GroupListProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-950">Grupos e seleções</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Visão inicial das seleções organizadas por grupo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {groups.map(group => (
          <article
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            key={group.id}
          >
            <h3 className="text-lg font-bold text-slate-950">
              Grupo {group.name}
            </h3>
            <ul className="mt-4 space-y-3">
              {group.teams.map(team => (
                <li
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-700"
                  key={team.id}
                >
                  <span className="min-w-0">
                    <span className="mr-2 font-bold text-slate-950">
                      {team.countryCode}
                    </span>
                    <span className="font-medium">{team.name}</span>
                  </span>
                  <FlagIcon
                    className="text-xl"
                    countryName={team.name}
                    flagIconCode={team.flagIconCode}
                  />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
