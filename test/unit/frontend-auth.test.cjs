const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');

process.env.TS_NODE_PROJECT = path.join(
  process.cwd(),
  'apps/frontend/tsconfig.json',
);
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  ignoreDeprecations: '6.0',
  module: 'commonjs',
  moduleResolution: 'node',
  rootDir: '.',
});
require('ts-node/register/transpile-only');

const {
  ApiError,
  createApiError,
  getErrorMessage,
  getErrorMessages,
} = require('../../apps/frontend/src/lib/api-errors');
const {
  clearAuthToken,
  getAuthToken,
  hasAuthToken,
  saveAuthToken,
} = require('../../apps/frontend/src/auth/auth-storage');

function createJsonResponse(body, status = 400) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createLocalStorageMock() {
  const values = new Map();

  return {
    getItem: key => values.get(key) ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test('converte erros da API em mensagens de interface', async () => {
  const apiError = await createApiError(
    createJsonResponse({
      message: [
        'email deve ser válido',
        'senha deve ter pelo menos 8 caracteres',
      ],
      statusCode: 400,
    }),
  );

  assert.ok(apiError instanceof ApiError);
  assert.equal(apiError.statusCode, 400);
  assert.deepEqual(apiError.messages, [
    'email deve ser válido',
    'senha deve ter pelo menos 8 caracteres',
  ]);
  assert.deepEqual(getErrorMessages(apiError), apiError.messages);
});

test('usa mensagem simples, error ou fallback para falhas da API', async () => {
  const simpleMessage = await createApiError(
    createJsonResponse({ message: 'credenciais inválidas' }, 401),
  );
  const errorMessage = await createApiError(
    createJsonResponse({ error: 'Unauthorized' }, 401),
  );
  const fallbackMessage = await createApiError(
    new Response('', { status: 500 }),
  );

  assert.equal(getErrorMessage(simpleMessage), 'credenciais inválidas');
  assert.equal(getErrorMessage(errorMessage), 'Unauthorized');
  assert.equal(
    getErrorMessage(fallbackMessage),
    'Não foi possível completar a solicitação.',
  );
});

test('persiste e limpa access token no storage do cliente', () => {
  const previousWindow = global.window;
  global.window = {
    localStorage: createLocalStorageMock(),
  };

  try {
    assert.equal(getAuthToken(), null);
    assert.equal(hasAuthToken(), false);

    saveAuthToken('token-de-teste');

    assert.equal(getAuthToken(), 'token-de-teste');
    assert.equal(hasAuthToken(), true);

    clearAuthToken();

    assert.equal(getAuthToken(), null);
    assert.equal(hasAuthToken(), false);
  } finally {
    if (previousWindow === undefined) {
      delete global.window;
    } else {
      global.window = previousWindow;
    }
  }
});
