# Contexto de trabalho do Codex

Este arquivo registra o estado atual do projeto e as principais decisões tomadas durante a evolução inicial. Ele serve como ponto de retomada ao abrir o projeto em outro ambiente, especialmente após migrar o workspace de `/mnt/c/Projetos/bolao-copa` para o filesystem nativo do WSL.

## Estado atual

- Repositório GitHub: `anderson-sillos/bolao-copa`.
- Branch principal: `main`.
- Estado local esperado: `main` alinhada com `origin/main`.
- CI/CD ativo via GitHub Actions com checks granulares.
- Dependabot ativo e PRs recentes de dependências mesclados.
- Último commit observado nesta atualização:
  - `cdc6b07 ci: granulariza checks tecnicos (#30)`
- Workspace atual usado pelo Codex:
  - `/home/anderson/projetos/bolao-copa`

## Ambiente recomendado

O projeto deve ser trabalhado preferencialmente dentro do filesystem nativo do WSL, por exemplo:

```bash
/home/anderson/projetos/bolao-copa
```

Evitar desenvolvimento contínuo em:

```bash
/mnt/c/Projetos/bolao-copa
```

Motivo: projetos Node.js com `node_modules`, Next.js, NestJS, watchers e builds tendem a ficar muito mais lentos quando executados no filesystem montado do Windows.

Fluxo recomendado para migração:

```bash
mkdir -p ~/Projetos
cd ~/Projetos
git clone https://github.com/anderson-sillos/bolao-copa.git
cd bolao-copa
npm ci
code .
```

## Setup local

Comandos principais:

```bash
npm ci
npm run ci:runner
```

Validações usadas nas últimas changes:

```bash
npm run format:check
npm run lint
npm run build
npm run test:governance
npm run test:coverage
npm run test:foundation
npm run audit
openspec validate --all --strict
```

Observações recentes:

- `npm run build` pode falhar dentro do sandbox do Codex por restrição ao
  Turbopack criar processo/bind de porta; fora do sandbox validou com sucesso.
- `npm run audit` pode exigir rede; quando executado com acesso de rede,
  retornou `0 vulnerabilities`.
- `npm run test:foundation` usa Docker/PostgreSQL e validou build, migração,
  rollback, seed e testes de integração.

Avisos observados:

- `git-raw-commits@5.0.1` depreciado por dependência indireta.
- Pacotes com scripts ainda não aprovados pelo mecanismo do npm:
  - `@scarf/scarf`
  - `argon2`
  - `sharp`

Esses avisos não bloquearam o CI.

## Decisões técnicas relevantes

### Organização do projeto

- Monorepo com workspaces npm.
- Aplicações em `apps/*`.
- Backend em NestJS.
- Frontend em Next.js.
- Banco PostgreSQL.
- TypeORM utilizado no backend.

### Frontend

- Next.js App Router.
- Tailwind CSS definido como framework de UI preferencial.
- Componentes foram reorganizados por domínio/feature para evitar acúmulo em uma única pasta genérica.
- Decisão registrada: manter componentes de página separados de componentes reutilizáveis/domínio sempre que a funcionalidade crescer.
- Markdown configurado no VS Code para abrir em modo preview por padrão.

### Autenticação

- Autenticação inicial implementada com cadastro, login e JWT.
- Hash de senha com Argon2id.
- Access token com expiração de 1 hora.
- Cadastro retorna token automaticamente.
- Política de senha mínima: 8 caracteres.
- Mensagens de validação foram ajustadas para evitar textos genéricos/em inglês do `class-validator`.

Itens registrados para roadmap/futuro:

- Session cookie.
- Rate limit e lockout por tentativas inválidas.
- Login social via OAuth.
- MFA.

### Dados da Copa

- Telas autenticadas para dados da Copa:
  - grupos;
  - seleções;
  - agenda de jogos;
  - fases eliminatórias em formato de chaves.
- Acesso aos dados da Copa exige usuário autenticado.
- Bandeiras passaram a usar abordagem compatível com browsers usando ícones/representação visual estável em vez de depender apenas de emoji Unicode.
- Scores de jogos tratam partidas sem resultado e decisões por pênaltis.
- Fases eliminatórias usam `bracket_order` no seed para controlar a ordem visual das chaves.
- Chaveamento possui navegação horizontal e alinhamento dinâmico entre fases.

### Palpites

- Fluxo autenticado de palpites implementado.
- Tela de palpites permite informar placar por time usando dois campos
  individuais.
- Lista de jogos foi agrupada para evitar uma lista única extensa.
- Quadros de jogos exibem feedback de aberto/fechado no botão de visualização.
- Quadros iniciam fechados quando não há jogo aberto para palpite.
- Inputs de placar não usam placeholder `0`, evitando confusão com valor
  informado.
- Botões de incremento/decremento assumem `0` no primeiro clique quando o campo
  ainda está vazio.
- Seed da Copa 2026 foi resincronizado a partir de
  `openfootball/worldcup.json`.

### CI/CD

- Workflow `Metadata` roda apenas em eventos de pull request e valida:
  - nome da branch;
  - título do PR via Commitlint.
- Workflow `Validate` roda em push e pull request com checks granulares:
  - `Format`;
  - `Lint`;
  - `Build`;
  - `Governance`;
  - `Coverage`;
  - `Foundation`;
  - `Audit`.
- `Metadata` não aparece mais como check skipped em push.
- `Foundation` é o único job que declara PostgreSQL como service container.
- Branch protection da `main` foi atualizada para exigir:
  - `Metadata`;
  - `Format`;
  - `Lint`;
  - `Build`;
  - `Governance`;
  - `Coverage`;
  - `Foundation`;
  - `Audit`.
- O check antigo `Validate` não deve ficar como required check na branch
  protection.

## OpenSpec

O projeto segue abordagem OpenSpec para mudanças relevantes.

Changes arquivadas relevantes:

- `setup-inicial-projeto`
- `adicionar-fundacao-de-entrega`
- `modernizar-toolchain-typescript`
- `padronizar-governanca-git`
- `migrar-typeorm-1`
- `implementar-autenticacao-usuarios`
- `melhorar-validacao-docs-debug`
- `implementar-ui-autenticacao`
- `exibir-dados-copa`
- `implementar-palpites-jogos`
- `melhorar-workflows-ci`
- `granularizar-workflows-ci`

Specs principais:

- `openspec/specs/project-foundation/spec.md`
- `openspec/specs/delivery-foundation/spec.md`
- `openspec/specs/version-control-governance/spec.md`
- `openspec/specs/user-authentication/spec.md`
- `openspec/specs/frontend-authentication/spec.md`
- `openspec/specs/world-cup-data/spec.md`
- `openspec/specs/typeorm-compatibility/spec.md`
- `openspec/specs/typescript-toolchain/spec.md`
- `openspec/specs/match-bets/spec.md`

Para próximas mudanças, manter o ciclo:

1. explorar/decidir escopo;
2. criar change OpenSpec;
3. revisar proposta/design/tasks;
4. implementar;
5. verificar;
6. arquivar a change no mesmo PR, quando possível.

Ritual acordado para fechamento de PR:

1. confirmar checks verdes;
2. arquivar a change OpenSpec no mesmo PR;
3. fazer squash merge;
4. voltar para `main`;
5. atualizar `main`;
6. remover branch de trabalho local/remota quando aplicável;
7. confirmar estado limpo.

## Governança Git

- Branch principal: `main`.
- Commits seguem Conventional Commits.
- PRs devem passar pelo CI antes do merge.
- Dependabot está configurado para atualizar dependências.
- `package-lock.json` deve permanecer versionado.
- Estratégia acordada: quando possível, arquivar a change OpenSpec no mesmo PR da implementação.
- Branches de trabalho recentes usam prefixos como `feat/` ou `ci/` e devem ser
  removidas após o merge.

## PRs recentes

PRs mesclados recentemente:

- `#23` Dependabot: eslint ecosystem.
- `#24` Dependabot: npm minor/patch group.
- `#25` Dependabot: `@types/node`.
- `#26` Feature: exibir dados autenticados da Copa.
- `#27` Docs: registra contexto de trabalho do Codex.
- `#28` Feature: implementa fluxo autenticado de palpites.
- `#29` CI: separa workflows de metadata e validação.
- `#30` CI: granulariza checks técnicos.

No momento desta atualização, não havia PR aberto e a `main` local estava
alinhada com `origin/main`.

## Próximos passos sugeridos

1. Criar a próxima change OpenSpec antes de implementar novas funcionalidades.
2. Considerar como próxima frente `gerenciar-grupos-bolao`.
3. Modelar grupos de bolão, participantes e convites antes de ranking.
4. Depois implementar regras de pontuação.
5. Em seguida implementar ranking por grupo de bolão.

Possíveis próximas frentes:

- Regras de bolões e participantes.
- Grupos de bolão, participantes, convites, dono/admin e associação de palpites
  ao grupo.
- Ranking por grupo de bolão.
- Regras de pontuação dos palpites.
- Melhorias de segurança de sessão e autenticação.
- Refinamentos de UX nas telas autenticadas.
- Revisão dos scripts pendentes do npm via `npm approve-scripts`.
