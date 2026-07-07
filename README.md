# Bolão da Copa 2026

Monorepo da aplicação web para um bolão da Copa do Mundo de 2026. A fundação do
projeto contém um frontend Next.js, uma API NestJS e um banco PostgreSQL com
migração e dados iniciais.

Repositório: https://github.com/anderson-sillos/bolao-copa

## Tecnologias

- Node.js 24.18.0 LTS
- npm 11+
- TypeScript 6
- ESLint 10 com flat config
- Next.js 16 e React 19
- Tailwind CSS 4
- NestJS 11
- TypeORM 1.0
- PostgreSQL 15
- Docker Compose

## Estrutura do projeto

```text
.
├── apps/
│   ├── backend/       # API NestJS, entidades, migração e seed
│   └── frontend/      # Aplicação Next.js
├── openspec/          # Especificações e histórico das mudanças
├── test/              # Testes de integração da fundação
├── docker-compose.yml
└── package.json       # Workspaces e comandos executados pela raiz
```

## Pré-requisitos

- Node.js `24.18.0` — consulte o arquivo `.node-version`
- npm `11` ou superior
- Docker com o comando `docker compose`

Confirme as versões instaladas:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Início rápido

Todos os comandos abaixo são executados na raiz do repositório.

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o backend

No WSL ou Linux:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

No PowerShell:

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env.local
```

As configurações padrão são:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret
DB_DATABASE=bolao_copa
PORT=3000
CORS_ORIGIN=http://localhost:3001
API_DOCS_ENABLED=true
AUTH_JWT_SECRET=troque-este-segredo-local-com-mais-de-32-caracteres
AUTH_TOKEN_EXPIRES_IN=1h
```

O frontend usa:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Não versione o arquivo `.env`.

### 3. Inicie o PostgreSQL

```bash
docker compose up -d postgres
```

### 4. Crie e popule o banco

```bash
npm run migration:run --workspace=backend
npm run seed --workspace=backend
```

O seed insere 12 grupos, 48 seleções e 104 jogos. Quando disponível na fonte de
referência, o placar final é persistido em `score_a`/`score_b` e a decisão por
pênaltis em `penalty_score_a`/`penalty_score_b`. Jogos eliminatórios ainda sem
seleções definidas são mantidos com referências de time nulas e origem textual
do participante, como `W89` ou `L101`, para indicar vencedor/perdedor de jogos
anteriores.

### 5. Inicie as aplicações

Em um terminal:

```bash
npm run start:dev --workspace=backend
```

Em outro terminal:

```bash
npm run dev --workspace=frontend
```

Serviços locais:

| Serviço    | Endereço                        |
| ---------- | ------------------------------- |
| Frontend   | http://localhost:3001           |
| Backend    | http://localhost:3000           |
| Health     | http://localhost:3000/health    |
| Swagger UI | http://localhost:3000/docs      |
| OpenAPI    | http://localhost:3000/docs-json |
| PostgreSQL | localhost:5432                  |

## Comandos principais

### Desenvolvimento e build

```bash
npm run start:dev --workspace=backend
npm run dev --workspace=frontend

npm run build --workspace=backend
npm run build --workspace=frontend
```

### Banco de dados

```bash
# Executar migrações pendentes
npm run migration:run --workspace=backend

# Reverter a última migração
npm run migration:revert --workspace=backend

# Gerar uma nova migração
npm run migration:generate --workspace=backend -- src/migrations/NomeDaMigracao

# Carregar os dados estáticos
npm run seed --workspace=backend
```

### Qualidade e testes

```bash
npm run lint --workspace=backend
npm run lint --workspace=frontend

npm run format --workspace=backend
npm run format --workspace=frontend

npm run test:foundation
npm run test:coverage
npm run ci
```

`test:foundation` inicia o PostgreSQL pelo Docker Compose, compila os dois
workspaces e usa um banco isolado chamado `bolao_copa_test`. A suíte valida:

- criação e rollback do schema;
- seed de grupos, seleções e jogos;
- restrição de um palpite por usuário e jogo;
- resposta HTTP do backend;
- cadastro, login, token JWT e rota protegida de perfil;
- endpoints autenticados de grupos, seleções e jogos da Copa;
- endpoints autenticados de criação, atualização e consulta de palpites;
- documentação OpenAPI e carregamento da Swagger UI local;
- renderização da página inicial, páginas de cadastro/login e rotas `/copa` e
  `/palpites`.

O banco de teste é removido automaticamente ao final.

`npm run ci` reproduz localmente o contrato da integração contínua: formatação,
lint, builds, cobertura unitária, testes de integração e auditoria de
dependências.

## Autenticação da API

A API possui autenticação inicial por JWT bearer:

- `POST /auth/register`: cria usuário e retorna automaticamente um access token;
- `POST /auth/login`: autentica por e-mail e senha;
- `GET /auth/me`: retorna o perfil do usuário autenticado.

O cadastro exige senha com pelo menos 8 caracteres, contendo letras e números, e
rejeita senha igual ao nome ou e-mail normalizados. Senhas são armazenadas apenas
como hash Argon2id. Respostas públicas de usuário não expõem `password_hash`.

Tokens usam `AUTH_JWT_SECRET` e expiram conforme `AUTH_TOKEN_EXPIRES_IN`; o valor
padrão recomendado para desenvolvimento é `1h`. Use um segredo forte, único por
ambiente, com pelo menos 32 caracteres.

Exemplo de cadastro:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Participante","email":"participante@example.com","password":"Bolao2026"}'
```

Exemplo de rota protegida:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <access-token>"
```

## Autenticação no frontend

O frontend possui telas iniciais de cadastro e login:

- `GET /register`: formulário de cadastro com nome, e-mail e senha;
- `GET /login`: formulário de autenticação com e-mail e senha;
- `GET /`: home que mostra estado deslogado ou perfil autenticado.

Em sucesso, cadastro e login salvam o access token retornado pela API e
redirecionam para a home. A home lê o token, chama `GET /auth/me`, exibe nome e
e-mail do usuário autenticado e oferece logout local. Se o token estiver inválido
ou expirado, a sessão local é limpa e a interface volta ao estado deslogado.

Nesta fase inicial, o token é armazenado em `localStorage` para validar o fluxo
ponta a ponta. Essa estratégia é temporária; antes de produção, a evolução
planejada é usar cookie seguro/HTTP-only, refresh token e revogação server-side,
conforme registrado no [roadmap](docs/roadmap.md).

## Dados autenticados da Copa

A API expõe consultas autenticadas de leitura para os dados base da Copa:

- `GET /groups`: lista grupos com suas seleções;
- `GET /teams`: lista seleções com grupo e `flagIconCode`;
- `GET /games`: lista jogos ordenados por data/hora;
- `GET /games?phase=fase_de_grupos`: filtra jogos por fase válida.

Todas essas rotas exigem header bearer:

```bash
curl http://localhost:3000/groups \
  -H "Authorization: Bearer <access-token>"
```

No frontend, a rota protegida `GET /copa` consulta esses dados usando
`NEXT_PUBLIC_API_URL`. Usuários sem sessão local veem orientação para entrar ou
criar conta; tokens expirados limpam a sessão local.

A apresentação segue estas decisões:

- seleções pendentes em jogos eliminatórios são exibidas como “A definir”;
- fases técnicas, como `fase_de_grupos` e `quartas`, recebem rótulos amigáveis;
- eliminatórias são agrupadas visualmente como chaves por fase, sem inferir
  avanço automático entre jogos;
- `flagIconCode` é mantido na API como código compatível com a biblioteca de
  ícones de bandeira usada no frontend, com fallback textual/acessível.

## Palpites autenticados

A API expõe endpoints autenticados para que cada pessoa gerencie seus próprios
palpites de placar:

- `GET /bets`: lista os palpites do usuário logado;
- `GET /bets/:gameId`: retorna `{ "bet": <palpite|null> }` para um jogo;
- `POST /bets`: cria ou atualiza um palpite com `gameId`, `scoreA` e `scoreB`;
- `PUT /bets/:gameId`: atualiza o placar do palpite para um jogo.

Todas essas rotas exigem header bearer. Exemplo:

```bash
curl -X POST http://localhost:3000/bets \
  -H "Authorization: Bearer <access-token>" \
  -H 'Content-Type: application/json' \
  -d '{"gameId":"<game-id>","scoreA":2,"scoreB":1}'
```

Os placares devem ser inteiros não negativos. O sistema aceita somente um
palpite por usuário e jogo, bloqueia alterações depois do início da partida e
não libera palpites para confrontos ainda sem as duas seleções definidas.

No frontend, a rota protegida `GET /palpites` carrega jogos e palpites do
usuário usando `NEXT_PUBLIC_API_URL`. Usuários sem sessão local veem orientação
para entrar ou criar conta; tokens expirados limpam a sessão local.

## Organização do frontend

O frontend usa Pages Router. Arquivos em `apps/frontend/pages/` devem permanecer
enxutos, delegando UI, estado e lógica de caso de uso para `apps/frontend/src/`.

Convenção principal:

- `src/components/ui/`: componentes genéricos sem regra de negócio;
- `src/components/layout/`: layouts compartilhados, quando existirem;
- `src/features/<feature>/`: componentes, hooks, services e tipos específicos de
  uma área funcional;
- `src/lib/`: utilitários técnicos compartilhados.

Detalhes e exemplos estão em [docs/frontend.md](docs/frontend.md).

## Segurança, documentação e logs

O backend aplica cabeçalhos HTTP seguros com Helmet e não divulga o cabeçalho
`X-Powered-By`.

Quando `API_DOCS_ENABLED=true`, a documentação fica disponível em `/docs` com
Swagger UI carregado por dependência local, e o documento OpenAPI fica disponível
em `/docs-json`.

Cada resposta contém `X-Request-Id`. Um identificador válido enviado pelo
cliente é preservado; caso contrário, a API gera um UUID. O log HTTP registra o
identificador, método, caminho, status e duração da requisição.

Os comandos TypeORM e o seed carregam o `.env` local pela API nativa
`process.loadEnvFile` do Node.js 24. Variáveis já fornecidas pelo ambiente, como
na CI ou no Docker, têm precedência. O projeto não mantém dependência direta de
`dotenv` nesse fluxo.

O backend usa TypeORM 1.0 com `@nestjs/typeorm` 11.0.1 ou superior. A
compatibilidade esperada inclui build, migrations, rollback, seed e verificação
de drift de schema sem uso de `--force` ou `--legacy-peer-deps`.

## Hooks locais

O comando `npm install` configura o hook de pre-commit com Husky. Antes do
commit, lint-staged executa ESLint e Prettier somente nos arquivos staged. A CI
continua sendo a validação definitiva.

O lint usa `eslint.config.cjs` no formato flat config. A mesma configuração é
usada pela raiz, workspaces, lint-staged e GitHub Actions.

## Integração contínua

O workflow `.github/workflows/ci.yml` executa em pushes e pull requests usando
Node.js 24 e PostgreSQL 15. A instalação usa `npm ci` e o job chama
`npm run ci:runner`.

O Dependabot verifica semanalmente dependências npm e GitHub Actions.

O fluxo de branches, commits, pull requests, proteção da `main` e releases está
documentado no [guia de contribuição](CONTRIBUTING.md). A CI valida nomes de
branch e títulos de pull request; mensagens locais são verificadas pelo
Commitlint.

Localmente, `npm run ci` permanece como contrato principal. O uso opcional do
`act` para simular a orquestração do GitHub Actions está registrado como evolução
futura no guia de contribuição.

A `main` exige pull request, histórico linear e os checks `Metadata` e
`Validate`. O repositório aceita somente squash merge e remove a branch após a
integração.

## Docker

Além do PostgreSQL, o projeto possui imagens independentes para frontend e
backend:

```bash
docker compose build backend frontend
docker compose up -d
```

O Compose aguarda o healthcheck do PostgreSQL antes de iniciar o backend e usa
`GET /health` para verificar a aplicação.

## Modelo de dados inicial

- `users`: participantes do bolão;
- `groups`: grupos da competição;
- `teams`: seleções, códigos FIFA de três letras e código visual da bandeira;
- `games`: calendário, fase, placar e seleções participantes;
- `bets`: palpites de placar, limitados a um por usuário e jogo.

As bandeiras são armazenadas como códigos de ícone, por exemplo `br`, `us`,
`gb-eng` e `gb-sct`. O código FIFA permanece em `country_code`; o código de
ícone fica em `flag_icon_code` para evitar depender do suporte nativo a emoji do
sistema operacional.

## Recriar o banco local

> Atenção: o comando abaixo apaga todos os dados persistidos no volume local.

```bash
docker compose down -v
docker compose up -d postgres
npm run migration:run --workspace=backend
npm run seed --workspace=backend
```

## Solução de problemas

### Porta 5432 já está em uso

Verifique se há outro PostgreSQL local ou contêiner usando a porta:

```bash
docker ps
```

Pare o serviço conflitante ou altere a porta publicada no `docker-compose.yml` e
o valor de `DB_PORT`.

### Backend não conecta ao banco

Confira se o contêiner está ativo e saudável:

```bash
docker compose ps
docker compose logs postgres
```

Compare as credenciais do `.env` com as variáveis do `docker-compose.yml`.

### Comandos usam uma versão errada do Node.js

O projeto exige Node.js 24.18.0. Confirme que o gerenciador de versões ou o PATH
está respeitando `.node-version`:

```bash
node --version
which node
```

No PowerShell, use `Get-Command node`.

### Migração e entidades parecem divergentes

Use o modo de verificação do TypeORM:

```bash
npm run migration:generate --workspace=backend -- /tmp/SchemaCheck --check
```

O resultado esperado é `No changes in database schema were found`.

## Estado atual

A fundação executável está pronta com frontend, backend, banco, migração, seed,
CI, documentação OpenAPI, autenticação inicial por JWT, consulta autenticada
dos dados base da Copa e criação/edição autenticada de palpites.

Estes itens ainda não fazem parte do escopo implementado:

- regras de pontuação;
- ranking e interface final do bolão;
- refresh token e cookies HTTP-only;
- login social via OAuth, MFA e políticas avançadas de segurança;
- rate limiting, lockout e auditoria de tentativas de login.

As evoluções adiadas estão registradas no [roadmap](docs/roadmap.md).

## OpenSpec

O planejamento e os critérios de aceite ficam em `openspec/`. Mudanças são
propostas, implementadas, verificadas e arquivadas por esse fluxo antes de serem
consideradas concluídas.

## Contribuição

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo de branches, validações
obrigatórias e preparação de pull requests.
