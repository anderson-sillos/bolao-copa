import dataSource from '../data-source';
import { Team } from '../entities/team.entity';
import { Game } from '../entities/game.entity';
import { Group } from '../entities/group.entity';
import * as seedData from './seed.json';

type SeedGame = {
  team_a_code: string | null;
  team_b_code: string | null;
  game_time: string;
  phase: string;
};

type SeedTeam = {
  name: string;
  country_code: string;
  flag_unicode: string;
  group_name: string;
};

async function seed() {
  await dataSource.initialize();
  console.log('DataSource inicializado com sucesso.');

  const groupRepository = dataSource.getRepository(Group);
  const teamRepository = dataSource.getRepository(Team);
  const gameRepository = dataSource.getRepository(Game);

  // --- SEED GROUPS ---
  const groupsCount = await groupRepository.count();
  if (groupsCount === 0) {
    console.log('Populando a tabela de grupos (groups)...');
    const groups = seedData.groups.map(group => groupRepository.create(group));
    await groupRepository.save(groups);
    console.log(`${groups.length} grupos foram inseridos.`);
  } else {
    console.log('A tabela de grupos (groups) já está populada.');
  }

  // --- SEED TEAMS ---
  const teamsCount = await teamRepository.count();
  if (teamsCount === 0) {
    console.log('Populando a tabela de seleções (teams)...');
    const allGroups = await groupRepository.find();
    const groupsMap = new Map(allGroups.map(group => [group.name, group]));

    const teams = seedData.teams.map((team: SeedTeam) => {
      const group = groupsMap.get(team.group_name);
      if (!group) {
        throw new Error(
          `Grupo '${team.group_name}' não encontrado para a seleção '${team.name}'`,
        );
      }
      return teamRepository.create({
        name: team.name,
        countryCode: team.country_code,
        flagUnicode: team.flag_unicode,
        group,
      });
    });
    await teamRepository.save(teams);
    console.log(`${teams.length} seleções foram inseridas.`);
  } else {
    console.log('A tabela de seleções (teams) já está populada.');
  }

  // --- SEED GAMES ---
  const gamesCount = await gameRepository.count();
  if (gamesCount === 0) {
    console.log('Populando a tabela de jogos (games)...');
    const allTeams = await teamRepository.find();
    const teamsMap = new Map(allTeams.map(team => [team.countryCode, team]));

    const games = (seedData.games as SeedGame[]).map(game => {
      const teamA = game.team_a_code
        ? teamsMap.get(game.team_a_code)
        : undefined;
      const teamB = game.team_b_code
        ? teamsMap.get(game.team_b_code)
        : undefined;

      if (game.team_a_code && !teamA) {
        throw new Error(
          `Seleção '${game.team_a_code}' não encontrada para o time A`,
        );
      }

      if (game.team_b_code && !teamB) {
        throw new Error(
          `Seleção '${game.team_b_code}' não encontrada para o time B`,
        );
      }

      return gameRepository.create({
        teamA: teamA ?? null,
        teamB: teamB ?? null,
        gameTime: new Date(game.game_time),
        phase: game.phase,
      });
    });
    await gameRepository.save(games);
    console.log(`${games.length} jogos foram inseridos.`);
  } else {
    console.log('A tabela de jogos (games) já está populada.');
  }

  await dataSource.destroy();
  console.log('DataSource finalizado.');
}

seed().catch(error => {
  console.error('Erro durante o seeding:', error);
  process.exit(1);
});
