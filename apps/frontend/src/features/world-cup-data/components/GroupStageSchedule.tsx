import { GameCard } from './GameCard';
import type { WorldCupGame } from '../world-cup-data-types';

type GroupStageScheduleProps = {
  games: WorldCupGame[];
};

export function GroupStageSchedule({ games }: GroupStageScheduleProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-950">
          Agenda da fase de grupos
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Jogos ordenados por data e horário conforme a base inicial.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {games.map(game => (
          <GameCard
            game={game}
            key={game.id}
            metadataLabel={game.groupName ? `Grupo ${game.groupName}` : null}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
}
