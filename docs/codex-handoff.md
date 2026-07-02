# Contexto de trabalho do Codex

Este arquivo registra o estado atual do projeto e as principais decisões tomadas durante a evolução inicial. Ele serve como ponto de retomada ao abrir o projeto em outro ambiente, especialmente após migrar o workspace de `/mnt/c/Projetos/bolao-copa` para o filesystem nativo do WSL.

## Estado atual

- Repositório GitHub: `anderson-sillos/bolao-copa`.
- Branch principal: `main`.
- Estado local esperado: `main` alinhada com `origin/main`.
- CI/CD ativo via GitHub Actions.
- Dependabot ativo e PRs recentes de dependências mesclados.
- Último commit observado na criação deste arquivo:
  - `138324a chore(deps): bump the npm-minor-patch group across 1 directory with 6 updates (#24)`

## Ambiente recomendado

O projeto deve ser trabalhado preferencialmente dentro do filesystem nativo do WSL, por exemplo:

```bash
/home/anderson/Projetos/bolao-copa
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

Durante a última validação local em `/mnt/c`, o `npm ci` concluiu com sucesso:

- `598 packages` instalados;
- `0 vulnerabilities`;
- aviso de scripts pendentes para análise via `npm approve-scripts`.

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

Specs principais:

- `openspec/specs/project-foundation/spec.md`
- `openspec/specs/delivery-foundation/spec.md`
- `openspec/specs/version-control-governance/spec.md`
- `openspec/specs/user-authentication/spec.md`
- `openspec/specs/frontend-authentication/spec.md`
- `openspec/specs/world-cup-data/spec.md`
- `openspec/specs/typeorm-compatibility/spec.md`
- `openspec/specs/typescript-toolchain/spec.md`

Para próximas mudanças, manter o ciclo:

1. explorar/decidir escopo;
2. criar change OpenSpec;
3. revisar proposta/design/tasks;
4. implementar;
5. verificar;
6. arquivar a change no mesmo PR, quando possível.

## Governança Git

- Branch principal: `main`.
- Commits seguem Conventional Commits.
- PRs devem passar pelo CI antes do merge.
- Dependabot está configurado para atualizar dependências.
- `package-lock.json` deve permanecer versionado.
- Estratégia acordada: quando possível, arquivar a change OpenSpec no mesmo PR da implementação.

## PRs recentes

PRs mesclados recentemente:

- `#23` Dependabot: eslint ecosystem.
- `#24` Dependabot: npm minor/patch group.
- `#25` Dependabot: `@types/node`.
- `#26` Feature: exibir dados autenticados da Copa.

No momento da criação deste arquivo, não havia PR aberto.

## Próximos passos sugeridos

1. Migrar o clone para o filesystem nativo do WSL.
2. Abrir o projeto pelo VS Code conectado ao WSL.
3. Rodar `npm ci`.
4. Rodar `npm run ci:runner`.
5. Criar a próxima change OpenSpec antes de implementar novas funcionalidades.

Possíveis próximas frentes:

- Regras de bolões e participantes.
- Melhorias de segurança de sessão e autenticação.
- Refinamentos de UX nas telas autenticadas.
- Revisão dos scripts pendentes do npm via `npm approve-scripts`.
