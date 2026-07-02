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
const {
  BRACKET_GAME_SLOT_HEIGHT_REM,
  formatGameDateTime,
  formatGamePhase,
  getBracketGameTopRem,
  isGroupStageGame,
  isKnockoutStageGame,
  orderKnockoutGamesForBracket,
  splitWorldCupGamesByStage,
} = require('../../apps/frontend/src/features/world-cup-data/world-cup-data-formatters');

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

test('formata dados de apresentação da Copa', () => {
  assert.equal(formatGamePhase('fase_de_grupos'), 'Fase de grupos');
  assert.equal(formatGamePhase('final'), 'Final');
  assert.match(
    formatGameDateTime('2026-06-11T19:00:00.000Z'),
    /\d{2}\/\d{2}\/\d{4}/,
  );
});

test('separa jogos de fase de grupos e eliminatórias', () => {
  const groupGame = {
    id: 'jogo-grupo',
    phase: 'fase_de_grupos',
    gameTime: '2026-06-11T19:00:00.000Z',
    scoreA: null,
    scoreB: null,
    penaltyScoreA: null,
    penaltyScoreB: null,
    matchNumber: 1,
    bracketOrder: null,
    teamASource: null,
    teamBSource: null,
    groupName: 'A',
    teamA: null,
    teamB: null,
  };
  const finalGame = {
    ...groupGame,
    id: 'jogo-final',
    phase: 'final',
  };

  assert.equal(isGroupStageGame(groupGame), true);
  assert.equal(isKnockoutStageGame(finalGame), true);
  assert.deepEqual(splitWorldCupGamesByStage([groupGame, finalGame]), {
    groupStage: [groupGame],
    knockoutStage: [finalGame],
  });
});

test('ordena chaves eliminatórias pelo bracket_order do seed', () => {
  const segundaFase = [
    createGame(73, 'segunda_fase', 1),
    createGame(74, 'segunda_fase', 3),
    createGame(75, 'segunda_fase', 2),
    createGame(76, 'segunda_fase', 5),
    createGame(77, 'segunda_fase', 4),
    createGame(78, 'segunda_fase', 6),
    createGame(79, 'segunda_fase', 7),
    createGame(80, 'segunda_fase', 8),
  ];
  const oitavas = [
    createGame(89, 'oitavas', 2, 'W74', 'W77'),
    createGame(90, 'oitavas', 1, 'W73', 'W75'),
    createGame(91, 'oitavas', 3, 'W76', 'W78'),
    createGame(92, 'oitavas', 4, 'W79', 'W80'),
  ];
  const quartas = [
    createGame(97, 'quartas', 1, 'W89', 'W90'),
    createGame(99, 'quartas', 2, 'W91', 'W92'),
  ];
  const semifinal = [createGame(101, 'semifinal', 1, 'W97', 'W99')];
  const final = [createGame(104, 'final', 1, 'W101', 'W102')];

  const ordered = orderKnockoutGamesForBracket({
    segunda_fase: segundaFase,
    oitavas,
    quartas,
    semifinal,
    final,
  });

  assert.deepEqual(
    ordered.oitavas.map(game => game.matchNumber),
    [90, 89, 91, 92],
  );
  assert.deepEqual(
    ordered.segunda_fase.map(game => game.matchNumber),
    [73, 75, 74, 77, 76, 78, 79, 80],
  );
});

test('calcula alinhamento vertical das chaves pelo bracket_order', () => {
  const game73 = createGame(73, 'segunda_fase', 1);
  const game75 = createGame(75, 'segunda_fase', 2);
  const game90 = createGame(90, 'oitavas', 1, 'W73', 'W75');
  const game101 = createGame(101, 'semifinal', 1, 'W97', 'W98');
  const game102 = createGame(102, 'semifinal', 2, 'W99', 'W100');
  const game104 = createGame(104, 'final', 1, 'W101', 'W102');

  const game73Top = getBracketGameTopRem(game73, 16, 16);
  const game75Top = getBracketGameTopRem(game75, 16, 16);
  const game90Top = getBracketGameTopRem(game90, 8, 16);
  const game101Top = getBracketGameTopRem(game101, 2, 2);
  const game102Top = getBracketGameTopRem(game102, 2, 2);
  const game104Top = getBracketGameTopRem(game104, 1, 2);

  assert.equal(game75Top - game73Top, BRACKET_GAME_SLOT_HEIGHT_REM);
  assert.equal(game90Top, (game73Top + game75Top) / 2);
  assert.equal(game104Top, (game101Top + game102Top) / 2);
});

function createGame(
  matchNumber,
  phase,
  bracketOrder = null,
  teamASource = null,
  teamBSource = null,
) {
  return {
    id: `jogo-${matchNumber}`,
    phase,
    gameTime: `2026-07-${String(matchNumber).padStart(2, '0')}T12:00:00.000Z`,
    scoreA: null,
    scoreB: null,
    penaltyScoreA: null,
    penaltyScoreB: null,
    matchNumber,
    bracketOrder,
    teamASource,
    teamBSource,
    groupName: null,
    teamA: null,
    teamB: null,
  };
}
