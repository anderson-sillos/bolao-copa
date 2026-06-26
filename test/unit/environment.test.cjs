const assert = require('node:assert/strict');
const { mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { test } = require('node:test');
const { tmpdir } = require('node:os');
const path = require('node:path');

process.env.TS_NODE_PROJECT = path.join(
  process.cwd(),
  'apps/backend/tsconfig.json',
);
require('ts-node/register');

const {
  validateEnvironment,
} = require('../../apps/backend/src/config/environment');
const {
  loadLocalEnvironment,
} = require('../../apps/backend/src/config/load-local-environment');

const validEnvironment = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'secret',
  DB_DATABASE: 'bolao_copa',
  CORS_ORIGIN: 'http://localhost:3001',
  AUTH_JWT_SECRET: 'segredo-local-de-teste-com-mais-de-32-caracteres',
  AUTH_TOKEN_EXPIRES_IN: '1h',
};

function createTemporaryDirectory(prefix) {
  try {
    return mkdtempSync(path.join(tmpdir(), prefix));
  } catch (error) {
    if (error.code === 'EROFS') {
      return mkdtempSync(path.join('/tmp', prefix));
    }
    throw error;
  }
}

test('normaliza uma configuração válida e aplica valores padrão', () => {
  assert.deepEqual(validateEnvironment(validEnvironment), {
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_USERNAME: 'postgres',
    DB_PASSWORD: 'secret',
    DB_DATABASE: 'bolao_copa',
    PORT: 3000,
    CORS_ORIGIN: 'http://localhost:3001',
    API_DOCS_ENABLED: false,
    AUTH_JWT_SECRET: 'segredo-local-de-teste-com-mais-de-32-caracteres',
    AUTH_TOKEN_EXPIRES_IN: '1h',
  });
});

test('aceita porta e documentação configuradas explicitamente', () => {
  const environment = validateEnvironment({
    ...validEnvironment,
    PORT: '3100',
    API_DOCS_ENABLED: 'true',
  });

  assert.equal(environment.PORT, 3100);
  assert.equal(environment.API_DOCS_ENABLED, true);
});

test('rejeita segredo JWT fraco e expiração inválida', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        AUTH_JWT_SECRET: 'curto',
      }),
    /AUTH_JWT_SECRET/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        AUTH_TOKEN_EXPIRES_IN: '1 hora',
      }),
    /AUTH_TOKEN_EXPIRES_IN/,
  );
});

test('rejeita variáveis obrigatórias vazias', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, DB_PASSWORD: ' ' }),
    /DB_PASSWORD/,
  );
});

test('rejeita portas fora da faixa TCP', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, DB_PORT: '65536' }),
    /DB_PORT/,
  );
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, PORT: 'abc' }),
    /PORT/,
  );
});

test('rejeita origem CORS e booleano inválidos', () => {
  assert.throws(
    () => validateEnvironment({ ...validEnvironment, CORS_ORIGIN: 'local' }),
    /CORS_ORIGIN/,
  );
  assert.throws(
    () =>
      validateEnvironment({
        ...validEnvironment,
        API_DOCS_ENABLED: 'yes',
      }),
    /API_DOCS_ENABLED/,
  );
});

test('carrega .env local sem sobrescrever variáveis já fornecidas', () => {
  const directory = createTemporaryDirectory('bolao-env-');
  const environmentFile = path.join(directory, '.env');
  const preservedValue = process.env.DB_HOST;

  writeFileSync(
    environmentFile,
    'DB_HOST=arquivo-local\nTOOLCHAIN_ENV_TEST=carregado\n',
  );
  process.env.DB_HOST = 'ambiente-ci';
  delete process.env.TOOLCHAIN_ENV_TEST;

  try {
    loadLocalEnvironment(environmentFile);
    assert.equal(process.env.DB_HOST, 'ambiente-ci');
    assert.equal(process.env.TOOLCHAIN_ENV_TEST, 'carregado');
  } finally {
    if (preservedValue === undefined) {
      delete process.env.DB_HOST;
    } else {
      process.env.DB_HOST = preservedValue;
    }
    delete process.env.TOOLCHAIN_ENV_TEST;
    rmSync(directory, { recursive: true, force: true });
  }
});
