## Context

A base atual já possui usuários autenticados, dados da Copa em endpoints
protegidos, tela `/copa` e o modelo `bets` com restrição única por usuário e
jogo. O próximo passo é expor esse modelo como fluxo de produto: a pessoa logada
deve conseguir registrar e revisar seus palpites antes do início das partidas.

A implementação deve seguir os padrões existentes: NestJS com módulos/services
focados, DTOs explícitos em vez de entidades TypeORM expostas diretamente,
Pages Router no frontend, páginas enxutas em `apps/frontend/pages/` e lógica de
feature em `apps/frontend/src/features/`.

## Baseline inicial

- Data do baseline: 2026-07-02.
- Branch da change: `feat/implementar-palpites-jogos`.
- Base da `main`: alinhada com `origin/main` antes da criação da branch.
- Estado inicial: apenas os artefatos OpenSpec da change estavam não
  rastreados.
- Versões confirmadas:
  - Node.js `v24.18.0`;
  - npm `11.16.0`.
- Validação rápida executada:
  - `openspec validate implementar-palpites-jogos --strict`.

## Goals / Non-Goals

**Goals:**

- Criar endpoints autenticados para consultar, criar e atualizar os palpites do
  usuário logado.
- Reaproveitar a tabela `bets` e sua unicidade de usuário/jogo.
- Validar placares como inteiros não negativos.
- Bloquear criação e atualização de palpites após o início do jogo.
- Criar uma tela protegida para preencher e revisar palpites.
- Registrar o comportamento em OpenAPI, README e testes automatizados.

**Non-Goals:**

- Calcular pontuação dos palpites.
- Criar ranking, ligas ou bolões múltiplos.
- Permitir palpites públicos ou consulta de palpites de outros usuários.
- Implementar seleção de campeão, artilheiro ou regras especiais.
- Alterar o modelo de autenticação baseado em `localStorage`.

## Decisions

- **Capability `match-bets`:** os palpites ficam em uma capability própria
  porque são o primeiro fluxo jogável do bolão e serão base para pontuação e
  ranking. Alternativa considerada: incluir o comportamento em `world-cup-data`,
  mas isso misturaria dados somente leitura da Copa com dados mutáveis do
  participante.
- **Endpoints centrados no usuário autenticado:** expor rotas como `GET /bets`,
  `GET /bets/:gameId`, `POST /bets` e `PUT /bets/:gameId`, sempre filtrando pelo
  usuário do token. Alternativa considerada: rotas aninhadas em `/games/:id/bet`;
  a rota `/bets` facilita listar o estado geral de palpites do usuário para a
  tela.
- **DTOs explícitos:** retornar `id`, `gameId`, `scoreA`, `scoreB`,
  `createdAt`, `updatedAt` e um resumo do jogo suficiente para a tela. Entidades
  TypeORM não devem ser retornadas diretamente para evitar vazamento de relações
  e campos internos.
- **Criação e atualização idempotentes para usuário/jogo:** `POST /bets` cria o
  palpite quando não existir e atualiza o registro existente quando o par
  usuário/jogo já existir. `PUT /bets/:gameId` exige o jogo na rota e aplica a
  mesma regra de validação. A restrição única continua sendo a garantia final no
  banco.
- **Bloqueio por horário do jogo:** usar `game.gameTime <= now` como regra para
  rejeitar criação ou atualização. Essa regra é simples, auditável e independe
  de placar já conhecido no seed.
- **Sem palpites para jogos sem seleções definidas:** permitir palpites apenas
  quando `teamAId` e `teamBId` existirem. Isso evita palpites contra
  participantes abstratos como `W89` antes de os confrontos estarem definidos.
- **Tela protegida `/palpites`:** criar uma página fina que compõe uma feature
  `match-bets`. A tela deve carregar jogos e palpites do usuário, mostrar
  placares editáveis quando permitido e estados bloqueados quando o jogo já
  iniciou ou ainda não possui seleções definidas.
- **Salvamento por jogo:** cada card/linha de jogo deve salvar seu próprio
  palpite para reduzir risco de perda de preenchimento em uma lista longa. A UI
  deve mostrar feedback de salvamento, erro e estado salvo por jogo.

## Risks / Trade-offs

- **Horário do servidor diferente do esperado pelo usuário** -> usar o backend
  como fonte de verdade e exibir horário do jogo de forma clara no frontend.
- **Conflito de criação simultânea do mesmo palpite** -> manter a restrição
  `UQ_bets_user_game` e tratar conflito como atualização ou erro compreensível.
- **Tela de palpites ficar grande com 104 jogos** -> agrupar por fase/data e
  manter componentes pequenos, com controles compactos e estados por jogo.
- **Palpites em eliminatórias pendentes confundirem o usuário** -> bloquear
  edição enquanto `teamA` ou `teamB` estiver ausente e exibir “A definir”.
- **Regras futuras de pontuação exigirem dados adicionais** -> manter esta
  change restrita a placar simples, sem acoplar a pontuação ainda inexistente.

## Migration Plan

Não há migration esperada nesta change porque a tabela `bets` já existe com os
campos necessários. Se a implementação identificar lacuna real no schema, a
change deve registrar explicitamente a migration e atualizar os testes de drift.

## Open Questions

- A ordenação inicial da tela de palpites deve priorizar próximos jogos ou seguir
  estritamente a agenda por data/hora? Decisão inicial proposta: data/hora
  crescente, com estados visuais para editável/bloqueado.
