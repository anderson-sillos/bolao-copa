const assert = require('node:assert/strict');
const { createHmac, randomUUID } = require('node:crypto');
const { execFileSync, spawn } = require('node:child_process');
const { after, before, test } = require('node:test');
const { setTimeout: delay } = require('node:timers/promises');
const path = require('node:path');
const { Client } = require('pg');

const rootDir = process.cwd();
process.env.TS_NODE_PROJECT = path.join(rootDir, 'apps/backend/tsconfig.json');
require('ts-node/register');

const {
  validateEnvironment,
} = require('../apps/backend/src/config/environment');
const { HealthService } = require('../apps/backend/src/health/health.service');

const testDatabase = 'bolao_copa_test';
const backendPort = 3100;
const frontendPort = 3101;
const authJwtSecret = 'segredo-de-integracao-com-mais-de-32-caracteres';

const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'secret',
};

const testEnvironment = {
  ...process.env,
  DB_HOST: databaseConfig.host,
  DB_PORT: String(databaseConfig.port),
  DB_USERNAME: databaseConfig.user,
  DB_PASSWORD: databaseConfig.password,
  DB_DATABASE: testDatabase,
  PORT: String(backendPort),
  CORS_ORIGIN: `http://localhost:${frontendPort}`,
  NEXT_PUBLIC_API_URL: `http://localhost:${backendPort}`,
  API_DOCS_ENABLED: 'true',
  AUTH_JWT_SECRET: authJwtSecret,
  AUTH_TOKEN_EXPIRES_IN: '1h',
  NODE_ENV: 'test',
};

const processes = new Set();

function run(command, args, environment = testEnvironment) {
  execFileSync(command, args, {
    cwd: rootDir,
    env: environment,
    stdio: 'inherit',
  });
}

async function withClient(database, callback) {
  const client = new Client({
    ...databaseConfig,
    database,
  });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function recreateTestDatabase() {
  await withClient('postgres', async client => {
    await client.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [testDatabase],
    );
    await client.query(`DROP DATABASE IF EXISTS "${testDatabase}"`);
    await client.query(`CREATE DATABASE "${testDatabase}"`);
  });
}

async function dropTestDatabase() {
  await withClient('postgres', async client => {
    await client.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [testDatabase],
    );
    await client.query(`DROP DATABASE IF EXISTS "${testDatabase}"`);
  });
}

function startProcess(command, args, environment = testEnvironment) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: environment,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  processes.add(child);
  return child;
}

function base64Url(input) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function signExpiredToken(payload) {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' });
  const body = base64Url({
    ...payload,
    iat: Math.floor(Date.now() / 1000) - 7200,
    exp: Math.floor(Date.now() / 1000) - 3600,
  });
  const signature = createHmac('sha256', authJwtSecret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function stopProcess(child) {
  if (!child || child.exitCode !== null) {
    return;
  }
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    child.kill('SIGTERM');
  }
  processes.delete(child);
}

async function waitForUrl(url, child, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let output = '';

  child.stdout.on('data', chunk => {
    output += chunk.toString();
  });
  child.stderr.on('data', chunk => {
    output += chunk.toString();
  });

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Processo encerrou antes de responder:\n${output}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {
      // O servidor ainda está inicializando.
    }
    await delay(250);
  }

  throw new Error(`Timeout aguardando ${url}:\n${output}`);
}

async function postJson(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

before(async () => {
  await recreateTestDatabase();
  run('npm', ['run', 'build', '--workspace=backend']);
  run('npm', ['run', 'build', '--workspace=frontend']);
});

after(async () => {
  for (const child of processes) {
    stopProcess(child);
  }
  await dropTestDatabase();
});

test('migração cria o schema e rollback remove as tabelas', async () => {
  run('npm', ['run', 'migration:run', '--workspace=backend']);

  await withClient(testDatabase, async client => {
    const result = await client.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('users', 'groups', 'teams', 'games', 'bets')
       ORDER BY table_name`,
    );
    assert.deepEqual(
      result.rows.map(row => row.table_name),
      ['bets', 'games', 'groups', 'teams', 'users'],
    );

    const teamsColumns = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'teams'
         AND column_name IN ('flag_icon_code', 'flag_unicode')
       ORDER BY column_name`,
    );
    assert.deepEqual(
      teamsColumns.rows.map(row => row.column_name),
      ['flag_icon_code'],
    );

    const gamesColumns = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'games'
         AND column_name IN (
           'bracket_order',
           'match_number',
           'penalty_score_a',
           'penalty_score_b',
           'team_a_source',
           'team_b_source'
         )
       ORDER BY column_name`,
    );
    assert.deepEqual(
      gamesColumns.rows.map(row => row.column_name),
      [
        'bracket_order',
        'match_number',
        'penalty_score_a',
        'penalty_score_b',
        'team_a_source',
        'team_b_source',
      ],
    );
  });

  run('npm', ['run', 'migration:revert', '--workspace=backend']);

  await withClient(testDatabase, async client => {
    const result = await client.query(
      `SELECT count(*)::int AS count
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('users', 'groups', 'teams', 'games', 'bets')`,
    );
    assert.equal(result.rows[0].count, 0);
  });

  run('npm', ['run', 'migration:run', '--workspace=backend']);
});

test('configuração inválida falha antes da inicialização', () => {
  assert.throws(
    () =>
      validateEnvironment({
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: '',
        DB_DATABASE: testDatabase,
        CORS_ORIGIN: `http://localhost:${frontendPort}`,
        AUTH_JWT_SECRET: authJwtSecret,
        AUTH_TOKEN_EXPIRES_IN: '1h',
      }),
    /DB_PASSWORD/,
  );
});

test('health check retorna falha quando o banco está indisponível', async () => {
  const service = new HealthService({
    query: async () => {
      throw new Error('database unavailable');
    },
  });

  await assert.rejects(service.check(), error => error.getStatus() === 503);
});

test('seed persiste grupos, seleções e todos os jogos', async () => {
  run('npm', ['run', 'seed', '--workspace=backend']);

  await withClient(testDatabase, async client => {
    const result = await client.query(`
      SELECT
        (SELECT count(*)::int FROM groups) AS groups,
        (SELECT count(*)::int FROM teams) AS teams,
        (SELECT count(*)::int FROM games) AS games,
        (SELECT count(*)::int FROM games
          WHERE team_a_id IS NULL AND team_b_id IS NULL) AS pending,
        (SELECT count(*)::int FROM games
          WHERE (team_a_id IS NULL) <> (team_b_id IS NULL)) AS partial,
        (SELECT count(*)::int FROM games
          WHERE score_a IS NOT NULL AND score_b IS NOT NULL) AS scored,
        (SELECT count(*)::int FROM games
          WHERE penalty_score_a IS NOT NULL
            AND penalty_score_b IS NOT NULL) AS penalties,
        (SELECT count(*)::int FROM games
          WHERE match_number IS NOT NULL) AS numbered,
        (SELECT count(*)::int FROM games
          WHERE bracket_order IS NOT NULL) AS bracketed,
        (SELECT count(*)::int FROM games
          WHERE team_a_source IS NOT NULL
             OR team_b_source IS NOT NULL) AS sourced
    `);

    assert.deepEqual(result.rows[0], {
      groups: 12,
      teams: 48,
      games: 104,
      pending: 5,
      partial: 0,
      scored: 94,
      penalties: 3,
      numbered: 104,
      bracketed: 32,
      sourced: 16,
    });
  });
});

test('banco rejeita dois palpites para o mesmo usuário e jogo', async () => {
  await withClient(testDatabase, async client => {
    const user = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ('Teste', 'teste@example.com', 'hash')
       RETURNING id`,
    );
    const game = await client.query(
      `SELECT id FROM games
       WHERE team_a_id IS NOT NULL AND team_b_id IS NOT NULL
       LIMIT 1`,
    );

    const values = [user.rows[0].id, game.rows[0].id, 1, 0];
    await client.query(
      `INSERT INTO bets (user_id, game_id, score_a, score_b)
       VALUES ($1, $2, $3, $4)`,
      values,
    );

    await assert.rejects(
      client.query(
        `INSERT INTO bets (user_id, game_id, score_a, score_b)
         VALUES ($1, $2, $3, $4)`,
        values,
      ),
      error =>
        error.code === '23505' && error.constraint === 'UQ_bets_user_game',
    );
  });
});

test('backend responde na rota raiz', async () => {
  const backend = startProcess('node', ['apps/backend/dist/main.js'], {
    ...testEnvironment,
    PORT: String(backendPort),
  });

  try {
    const response = await waitForUrl(
      `http://localhost:${backendPort}`,
      backend,
      120_000,
    );
    assert.deepEqual(await response.json(), {
      message: 'Hello from the NestJS API!',
    });
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.ok(response.headers.get('x-request-id'));

    const healthResponse = await fetch(
      `http://localhost:${backendPort}/health`,
      {
        headers: {
          'X-Request-Id': 'foundation-test',
        },
      },
    );
    assert.equal(healthResponse.status, 200);
    assert.equal(healthResponse.headers.get('x-request-id'), 'foundation-test');
    assert.deepEqual(await healthResponse.json(), {
      status: 'ok',
      database: 'up',
    });

    const docsResponse = await fetch(
      `http://localhost:${backendPort}/docs-json`,
    );
    assert.equal(docsResponse.status, 200);
    const openApi = await docsResponse.json();
    assert.equal(openApi.openapi, '3.0.3');
    assert.ok(openApi.paths['/health']);
    assert.ok(openApi.paths['/auth/register']);
    assert.ok(openApi.paths['/groups']);
    assert.ok(openApi.paths['/teams']);
    assert.ok(openApi.paths['/games']);
    assert.ok(openApi.paths['/bets']);
    assert.ok(openApi.paths['/bets/{gameId}']);
    assert.ok(
      openApi.components.schemas.WorldCupTeamSummary.properties.flagIconCode,
    );
    assert.ok(openApi.components.schemas.WorldCupGame.properties.penaltyScoreA);
    assert.ok(openApi.components.schemas.WorldCupGame.properties.penaltyScoreB);
    assert.ok(openApi.components.schemas.WorldCupGame.properties.matchNumber);
    assert.ok(openApi.components.schemas.WorldCupGame.properties.bracketOrder);
    assert.ok(openApi.components.schemas.WorldCupGame.properties.teamASource);
    assert.ok(openApi.components.schemas.WorldCupGame.properties.teamBSource);
    assert.ok(openApi.components.schemas.WorldCupGame.properties.groupName);
    assert.ok(openApi.components.schemas.MatchBet);
    assert.ok(openApi.components.schemas.SaveMatchBetRequest);
    assert.ok(openApi.components.schemas.UpdateMatchBetRequest);
    assert.ok(openApi.components.securitySchemes.bearerAuth);

    const docsHtmlResponse = await fetch(
      `http://localhost:${backendPort}/docs`,
    );
    assert.equal(docsHtmlResponse.status, 200);
    const docsHtml = await docsHtmlResponse.text();
    assert.doesNotMatch(docsHtml, /<script>\s*window\.addEventListener/);
    assert.match(docsHtml, /\/docs\/swagger-ui-bundle\.js/);
    assert.match(docsHtml, /\/docs\/swagger-ui-init\.js/);

    const docsAssetResponse = await fetch(
      `http://localhost:${backendPort}/docs/swagger-ui-bundle.js`,
    );
    assert.equal(docsAssetResponse.status, 200);
    assert.match(
      docsAssetResponse.headers.get('content-type'),
      /application\/javascript/,
    );

    const docsInitializerResponse = await fetch(
      `http://localhost:${backendPort}/docs/swagger-ui-init.js`,
    );
    assert.equal(docsInitializerResponse.status, 200);
    assert.match(
      docsInitializerResponse.headers.get('content-type'),
      /application\/javascript/,
    );
    const docsInitializer = await docsInitializerResponse.text();
    assert.match(docsInitializer, /SwaggerUIBundle/);
    assert.match(docsInitializer, /\/docs-json/);

    const suffix = Date.now();
    const authBase = `http://localhost:${backendPort}/auth`;
    const registerPayload = {
      name: 'Usuário Autenticado',
      email: `usuario-autenticado-${suffix}@example.com`,
      password: 'Bolao2026',
    };

    const weakPasswordResponse = await postJson(`${authBase}/register`, {
      ...registerPayload,
      email: `senha-fraca-${suffix}@example.com`,
      password: 'fraca',
    });
    assert.equal(weakPasswordResponse.status, 400);

    const invalidPayloadResponse = await postJson(`${authBase}/register`, {
      ...registerPayload,
      email: 'email-invalido',
    });
    assert.equal(invalidPayloadResponse.status, 400);
    assert.deepEqual((await invalidPayloadResponse.json()).message, [
      'Informe um e-mail válido',
    ]);

    const registerResponse = await postJson(
      `${authBase}/register`,
      registerPayload,
    );
    assert.equal(registerResponse.status, 201);
    const registration = await registerResponse.json();
    assert.equal(registration.tokenType, 'Bearer');
    assert.equal(registration.expiresIn, 3600);
    assert.equal(registration.user.email, registerPayload.email);
    assert.equal(registration.user.passwordHash, undefined);
    assert.ok(registration.accessToken);

    const profileResponse = await fetch(`${authBase}/me`, {
      headers: {
        Authorization: `Bearer ${registration.accessToken}`,
      },
    });
    assert.equal(profileResponse.status, 200);
    const profile = await profileResponse.json();
    assert.equal(profile.email, registerPayload.email);
    assert.equal(profile.passwordHash, undefined);

    const missingTokenResponse = await fetch(`${authBase}/me`);
    assert.equal(missingTokenResponse.status, 401);

    const invalidTokenResponse = await fetch(`${authBase}/me`, {
      headers: {
        Authorization: 'Bearer token-invalido',
      },
    });
    assert.equal(invalidTokenResponse.status, 401);

    const expiredToken = signExpiredToken({
      sub: registration.user.id,
      email: registration.user.email,
    });
    const expiredTokenResponse = await fetch(`${authBase}/me`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });
    assert.equal(expiredTokenResponse.status, 401);

    const loginResponse = await postJson(`${authBase}/login`, {
      email: registerPayload.email,
      password: registerPayload.password,
    });
    assert.equal(loginResponse.status, 200);
    const login = await loginResponse.json();
    assert.ok(login.accessToken);
    assert.equal(login.user.id, registration.user.id);

    const worldCupBase = `http://localhost:${backendPort}`;
    const authenticatedHeaders = {
      Authorization: `Bearer ${login.accessToken}`,
    };

    const unauthorizedGroupsResponse = await fetch(`${worldCupBase}/groups`);
    assert.equal(unauthorizedGroupsResponse.status, 401);

    const groupsResponse = await fetch(`${worldCupBase}/groups`, {
      headers: authenticatedHeaders,
    });
    assert.equal(groupsResponse.status, 200);
    const groups = await groupsResponse.json();
    assert.equal(groups.length, 12);
    assert.equal(groups[0].teams.length, 4);
    assert.ok(groups[0].teams[0].flagIconCode);

    const teamsResponse = await fetch(`${worldCupBase}/teams`, {
      headers: authenticatedHeaders,
    });
    assert.equal(teamsResponse.status, 200);
    const teams = await teamsResponse.json();
    assert.equal(teams.length, 48);
    assert.ok(teams[0].group);
    assert.equal(teams[0].passwordHash, undefined);

    const gamesResponse = await fetch(`${worldCupBase}/games`, {
      headers: authenticatedHeaders,
    });
    assert.equal(gamesResponse.status, 200);
    const games = await gamesResponse.json();
    assert.equal(games.length, 104);
    assert.ok(games[0].phase);
    assert.ok(games[0].gameTime);
    assert.equal(games[0].scoreA, 2);
    assert.equal(games[0].scoreB, 0);
    assert.equal(games[0].matchNumber, 1);
    assert.equal(games[0].bracketOrder, null);
    assert.equal(games[0].groupName, 'A');
    const gameWithPenalties = games.find(
      game => game.penaltyScoreA !== null && game.penaltyScoreB !== null,
    );
    assert.ok(gameWithPenalties);
    assert.equal(gameWithPenalties.scoreA, 1);
    assert.equal(gameWithPenalties.scoreB, 1);
    const gameWithSource = games.find(game => game.teamBSource === 'W80');
    assert.ok(gameWithSource);
    assert.equal(gameWithSource.teamA.countryCode, 'MEX');
    assert.equal(gameWithSource.bracketOrder, 6);

    const groupStageGamesResponse = await fetch(
      `${worldCupBase}/games?phase=fase_de_grupos`,
      {
        headers: authenticatedHeaders,
      },
    );
    assert.equal(groupStageGamesResponse.status, 200);
    const groupStageGames = await groupStageGamesResponse.json();
    assert.ok(groupStageGames.length > 0);
    assert.ok(groupStageGames.every(game => game.phase === 'fase_de_grupos'));

    const roundOf16GamesResponse = await fetch(
      `${worldCupBase}/games?phase=oitavas`,
      {
        headers: authenticatedHeaders,
      },
    );
    assert.equal(roundOf16GamesResponse.status, 200);
    const roundOf16Games = await roundOf16GamesResponse.json();
    assert.deepEqual(
      roundOf16Games.slice(0, 2).map(game => game.matchNumber),
      [90, 89],
    );
    assert.deepEqual(
      roundOf16Games.slice(0, 2).map(game => game.bracketOrder),
      [1, 2],
    );

    const invalidPhaseResponse = await fetch(
      `${worldCupBase}/games?phase=fase_inexistente`,
      {
        headers: authenticatedHeaders,
      },
    );
    assert.equal(invalidPhaseResponse.status, 400);

    const betFixtures = await withClient(testDatabase, async client => {
      const editableGame = await client.query(
        `SELECT id FROM games
         WHERE team_a_id IS NOT NULL AND team_b_id IS NOT NULL
         ORDER BY game_time ASC
         LIMIT 1`,
      );
      const lockedGame = await client.query(
        `SELECT id FROM games
         WHERE team_a_id IS NOT NULL AND team_b_id IS NOT NULL
         ORDER BY game_time ASC
         OFFSET 1
         LIMIT 1`,
      );
      const pendingGame = await client.query(
        `SELECT id FROM games
         WHERE team_a_id IS NULL OR team_b_id IS NULL
         ORDER BY game_time ASC
         LIMIT 1`,
      );

      await client.query(
        `UPDATE games
         SET game_time = NOW() + INTERVAL '7 days'
         WHERE id = $1`,
        [editableGame.rows[0].id],
      );
      await client.query(
        `UPDATE games
         SET game_time = NOW() - INTERVAL '1 day'
         WHERE id = $1`,
        [lockedGame.rows[0].id],
      );
      await client.query(
        `UPDATE games
         SET game_time = NOW() + INTERVAL '8 days'
         WHERE id = $1`,
        [pendingGame.rows[0].id],
      );

      return {
        editableGameId: editableGame.rows[0].id,
        lockedGameId: lockedGame.rows[0].id,
        pendingGameId: pendingGame.rows[0].id,
      };
    });

    const unauthorizedBetsResponse = await fetch(`${worldCupBase}/bets`);
    assert.equal(unauthorizedBetsResponse.status, 401);

    const emptyBetsResponse = await fetch(`${worldCupBase}/bets`, {
      headers: authenticatedHeaders,
    });
    assert.equal(emptyBetsResponse.status, 200);
    assert.deepEqual(await emptyBetsResponse.json(), []);

    const missingBetResponse = await fetch(
      `${worldCupBase}/bets/${betFixtures.editableGameId}`,
      {
        headers: authenticatedHeaders,
      },
    );
    assert.equal(missingBetResponse.status, 200);
    assert.deepEqual(await missingBetResponse.json(), { bet: null });

    const unauthenticatedCreateBetResponse = await postJson(
      `${worldCupBase}/bets`,
      {
        gameId: betFixtures.editableGameId,
        scoreA: 2,
        scoreB: 1,
      },
    );
    assert.equal(unauthenticatedCreateBetResponse.status, 401);

    const createdBetResponse = await fetch(`${worldCupBase}/bets`, {
      method: 'POST',
      headers: {
        ...authenticatedHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: betFixtures.editableGameId,
        scoreA: 2,
        scoreB: 1,
      }),
    });
    assert.equal(createdBetResponse.status, 201);
    const createdBet = await createdBetResponse.json();
    assert.equal(createdBet.gameId, betFixtures.editableGameId);
    assert.equal(createdBet.scoreA, 2);
    assert.equal(createdBet.scoreB, 1);
    assert.ok(createdBet.game.teamA);
    assert.ok(createdBet.game.teamB);

    const updatedBetResponse = await fetch(
      `${worldCupBase}/bets/${betFixtures.editableGameId}`,
      {
        method: 'PUT',
        headers: {
          ...authenticatedHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreA: 3,
          scoreB: 2,
        }),
      },
    );
    assert.equal(updatedBetResponse.status, 200);
    const updatedBet = await updatedBetResponse.json();
    assert.equal(updatedBet.id, createdBet.id);
    assert.equal(updatedBet.scoreA, 3);
    assert.equal(updatedBet.scoreB, 2);

    const invalidBetResponse = await fetch(`${worldCupBase}/bets`, {
      method: 'POST',
      headers: {
        ...authenticatedHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: betFixtures.editableGameId,
        scoreA: -1,
        scoreB: 1.5,
      }),
    });
    assert.equal(invalidBetResponse.status, 400);

    const nonexistentGameBetResponse = await fetch(`${worldCupBase}/bets`, {
      method: 'POST',
      headers: {
        ...authenticatedHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: randomUUID(),
        scoreA: 1,
        scoreB: 1,
      }),
    });
    assert.equal(nonexistentGameBetResponse.status, 404);

    const lockedGameBetResponse = await fetch(`${worldCupBase}/bets`, {
      method: 'POST',
      headers: {
        ...authenticatedHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: betFixtures.lockedGameId,
        scoreA: 1,
        scoreB: 0,
      }),
    });
    assert.equal(lockedGameBetResponse.status, 400);

    const pendingGameBetResponse = await fetch(`${worldCupBase}/bets`, {
      method: 'POST',
      headers: {
        ...authenticatedHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: betFixtures.pendingGameId,
        scoreA: 1,
        scoreB: 0,
      }),
    });
    assert.equal(pendingGameBetResponse.status, 400);

    const otherRegisterResponse = await postJson(`${authBase}/register`, {
      name: 'Outro Participante',
      email: `outro-participante-${suffix}@example.com`,
      password: 'Bolao2026',
    });
    assert.equal(otherRegisterResponse.status, 201);
    const otherRegistration = await otherRegisterResponse.json();
    const otherUserBetResponse = await fetch(
      `${worldCupBase}/bets/${betFixtures.editableGameId}`,
      {
        headers: {
          Authorization: `Bearer ${otherRegistration.accessToken}`,
        },
      },
    );
    assert.equal(otherUserBetResponse.status, 200);
    assert.deepEqual(await otherUserBetResponse.json(), { bet: null });

    const finalBetsResponse = await fetch(`${worldCupBase}/bets`, {
      headers: authenticatedHeaders,
    });
    assert.equal(finalBetsResponse.status, 200);
    const finalBets = await finalBetsResponse.json();
    assert.equal(finalBets.length, 1);
    assert.equal(finalBets[0].id, createdBet.id);

    const invalidLoginPayloadResponse = await postJson(`${authBase}/login`, {
      email: 'email-invalido',
      password: registerPayload.password,
    });
    assert.equal(invalidLoginPayloadResponse.status, 400);
    assert.deepEqual((await invalidLoginPayloadResponse.json()).message, [
      'Informe um e-mail válido',
    ]);

    const duplicatedResponse = await postJson(
      `${authBase}/register`,
      registerPayload,
    );
    assert.equal(duplicatedResponse.status, 409);

    const invalidLoginResponse = await postJson(`${authBase}/login`, {
      email: registerPayload.email,
      password: 'SenhaErrada2026',
    });
    assert.equal(invalidLoginResponse.status, 401);
  } finally {
    stopProcess(backend);
  }
});

test('frontend renderiza a página inicial', async () => {
  const frontend = startProcess(
    'npm',
    ['run', 'start', '--workspace=frontend', '--', '-p', String(frontendPort)],
    {
      ...testEnvironment,
      PORT: String(frontendPort),
    },
  );

  try {
    const response = await waitForUrl(
      `http://localhost:${frontendPort}`,
      frontend,
    );
    const html = await response.text();
    assert.match(html, /Bolão da Copa 2026/);
    assert.match(html, /Palpites, ranking/);
    assert.match(html, /Verificando sua sessão/);

    const loginResponse = await fetch(`http://localhost:${frontendPort}/login`);
    const loginHtml = await loginResponse.text();
    assert.match(loginHtml, /Entrar/);
    assert.match(loginHtml, /Informe seu e-mail e senha/);

    const registerResponse = await fetch(
      `http://localhost:${frontendPort}/register`,
    );
    const registerHtml = await registerResponse.text();
    assert.match(registerHtml, /Criar conta/);
    assert.match(registerHtml, /senha com pelo menos 8 caracteres/);

    const copaResponse = await fetch(`http://localhost:${frontendPort}/copa`);
    assert.equal(copaResponse.status, 200);
    const copaHtml = await copaResponse.text();
    assert.match(copaHtml, /Dados da Copa/);
    assert.match(copaHtml, /Verificando sua sessão/);

    const palpitesResponse = await fetch(
      `http://localhost:${frontendPort}/palpites`,
    );
    assert.equal(palpitesResponse.status, 200);
    const palpitesHtml = await palpitesResponse.text();
    assert.match(palpitesHtml, /Meus palpites/);
    assert.match(palpitesHtml, /Verificando sua sessão/);
  } finally {
    stopProcess(frontend);
  }
});
