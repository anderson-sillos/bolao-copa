const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
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
    assert.ok(openApi.paths['/auth/register']);
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
    assert.match(html, /Message from backend/);
  } finally {
    stopProcess(frontend);
  }
});
