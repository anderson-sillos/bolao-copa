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
const {
  adjustBetScore,
  createInitialBetFormState,
  createMatchBetMap,
  getMatchBetEditStatus,
  groupMatchBetGamesForDisplay,
  parseBetScore,
} = require('../../apps/frontend/src/features/match-bets/match-bets-helpers');

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

test('calcula estado de edição e formulário inicial de palpites', () => {
  const teamA = {
    id: 'time-a',
    name: 'Brasil',
    countryCode: 'BRA',
    flagIconCode: 'br',
  };
  const teamB = {
    id: 'time-b',
    name: 'Japão',
    countryCode: 'JPN',
    flagIconCode: 'jp',
  };
  const futureGame = {
    ...createGame(1, 'fase_de_grupos'),
    id: 'jogo-futuro',
    gameTime: '2026-07-20T12:00:00.000Z',
    teamA,
    teamB,
  };
  const startedGame = {
    ...futureGame,
    id: 'jogo-iniciado',
    gameTime: '2026-07-01T12:00:00.000Z',
  };
  const pendingGame = {
    ...futureGame,
    id: 'jogo-pendente',
    teamB: null,
  };
  const bet = {
    id: 'palpite',
    gameId: futureGame.id,
    scoreA: 2,
    scoreB: 1,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    game: futureGame,
  };

  assert.equal(
    getMatchBetEditStatus(futureGame, new Date('2026-07-10T12:00:00.000Z'))
      .canEdit,
    true,
  );
  assert.equal(
    getMatchBetEditStatus(startedGame, new Date('2026-07-10T12:00:00.000Z'))
      .label,
    'Palpites encerrados',
  );
  assert.equal(
    getMatchBetEditStatus(pendingGame, new Date('2026-07-10T12:00:00.000Z'))
      .label,
    'Confronto a definir',
  );

  const betMap = createMatchBetMap([bet]);
  assert.equal(betMap.get(futureGame.id), bet);
  assert.deepEqual(
    createInitialBetFormState([futureGame, pendingGame], [bet]),
    {
      [futureGame.id]: {
        scoreA: '2',
        scoreB: '1',
      },
      [pendingGame.id]: {
        scoreA: '',
        scoreB: '',
      },
    },
  );
});

test('interpreta placares de palpite como inteiros não negativos', () => {
  assert.equal(parseBetScore('0'), 0);
  assert.equal(parseBetScore('12'), 12);
  assert.equal(parseBetScore(' 3 '), 3);
  assert.equal(parseBetScore('-1'), null);
  assert.equal(parseBetScore('1.5'), null);
  assert.equal(parseBetScore('abc'), null);

  assert.equal(adjustBetScore('', 1), '0');
  assert.equal(adjustBetScore('', -1), '0');
  assert.equal(adjustBetScore('0', 1), '1');
  assert.equal(adjustBetScore('2', -1), '1');
  assert.equal(adjustBetScore('0', -1), '0');
});

test('agrupa jogos de palpites por fase e data', () => {
  const teamA = {
    id: 'time-a',
    name: 'Brasil',
    countryCode: 'BRA',
    flagIconCode: 'br',
  };
  const teamB = {
    id: 'time-b',
    name: 'Japão',
    countryCode: 'JPN',
    flagIconCode: 'jp',
  };
  const groupGame = {
    ...createGame(2, 'fase_de_grupos'),
    gameTime: '2026-06-11T23:00:00.000Z',
    teamA,
    teamB,
  };
  const earlierGroupGame = {
    ...createGame(1, 'fase_de_grupos'),
    gameTime: '2026-06-11T16:00:00.000Z',
    teamA,
    teamB,
  };
  const knockoutGame = {
    ...createGame(89, 'oitavas'),
    gameTime: '2026-07-04T18:00:00.000Z',
    teamA,
    teamB,
  };

  const groups = groupMatchBetGamesForDisplay(
    [knockoutGame, groupGame, earlierGroupGame],
    new Date('2026-06-10T12:00:00.000Z'),
  );

  assert.deepEqual(
    groups.map(group => group.phase),
    ['fase_de_grupos', 'oitavas'],
  );
  assert.equal(groups[0].label, 'Fase de grupos');
  assert.equal(groups[0].openGamesCount, 2);
  assert.equal(groups[0].totalGames, 2);
  assert.deepEqual(
    groups[0].dateGroups[0].games.map(game => game.matchNumber),
    [1, 2],
  );
  assert.equal(groups[1].openGamesCount, 1);
  assert.equal(groups[1].dateGroups[0].games[0], knockoutGame);
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
