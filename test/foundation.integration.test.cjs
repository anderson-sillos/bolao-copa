const assert = require('node:assert/strict');
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
          WHERE (team_a_id IS NULL) <> (team_b_id IS NULL)) AS partial
    `);

    assert.deepEqual(result.rows[0], {
      groups: 12,
      teams: 48,
      games: 104,
      pending: 28,
      partial: 4,
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
    assert.match(html, /Message from backend/);
  } finally {
    stopProcess(frontend);
  }
});
