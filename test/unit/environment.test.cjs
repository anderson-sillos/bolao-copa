const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

process.env.TS_NODE_PROJECT = path.join(
  process.cwd(),
  'apps/backend/tsconfig.json',
);
require('ts-node/register');

const {
  validateEnvironment,
} = require('../../apps/backend/src/config/environment');

const validEnvironment = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'secret',
  DB_DATABASE: 'bolao_copa',
  CORS_ORIGIN: 'http://localhost:3001',
};

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
