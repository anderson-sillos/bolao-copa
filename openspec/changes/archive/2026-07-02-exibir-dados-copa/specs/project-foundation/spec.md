## MODIFIED Requirements

### Requirement: Backend NestJS executável

O sistema SHALL disponibilizar uma aplicação backend NestJS compilável e
executável com a versão TypeScript adotada pela toolchain.

#### Scenario: Compilação do backend

- **WHEN** o comando de build do workspace backend for executado
- **THEN** a aplicação SHALL ser compilada sem erros de TypeScript, decorators ou
  resolução de módulos

#### Scenario: Endpoints autenticados de dados base

- **WHEN** o backend estiver em execução
- **THEN** a aplicação SHALL disponibilizar endpoints autenticados de leitura para
  grupos, seleções e jogos da Copa

### Requirement: Frontend Next.js executável

O sistema SHALL disponibilizar uma aplicação frontend Next.js com TypeScript,
uma página inicial renderizável e URL do backend configurável por ambiente.

#### Scenario: Build do frontend

- **WHEN** o comando de build do workspace frontend for executado
- **THEN** a aplicação SHALL ser compilada com a versão TypeScript adotada sem
  erros

#### Scenario: Página inicial

- **WHEN** o servidor frontend estiver em execução e a rota raiz for acessada
- **THEN** uma página inicial SHALL ser renderizada

#### Scenario: URL externa da API

- **WHEN** `NEXT_PUBLIC_API_URL` estiver configurada
- **THEN** o frontend SHALL usar esse valor para acessar o backend

#### Scenario: Tela protegida de dados da Copa

- **WHEN** o servidor frontend estiver em execução e a rota protegida da Copa for
  acessada
- **THEN** uma página SHALL exigir sessão local antes de renderizar dados de
  grupos, seleções e jogos consumidos da API configurada

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação e a compatibilidade da toolchain e da versão TypeORM adotada,
incluindo configuração, autenticação, dados autenticados da Copa e health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** build, migration, rollback, seed, unicidade de palpites, configuração,
  autenticação, health check, rotas básicas e dados autenticados da Copa SHALL
  ser validados em um banco isolado
