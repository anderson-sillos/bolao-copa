## MODIFIED Requirements

### Requirement: Backend NestJS executável

O sistema SHALL disponibilizar uma aplicação backend NestJS compilável,
executável com a versão TypeScript adotada pela toolchain e com feedback básico
de inicialização.

#### Scenario: Compilação do backend

- **WHEN** o comando de build do workspace backend for executado
- **THEN** a aplicação SHALL ser compilada sem erros de TypeScript, decorators ou
  resolução de módulos

#### Scenario: Endpoints autenticados de dados base

- **WHEN** o backend estiver em execução
- **THEN** a aplicação SHALL disponibilizar endpoints autenticados de leitura para
  grupos, seleções e jogos da Copa

#### Scenario: Endpoints autenticados de palpites

- **WHEN** o backend estiver em execução
- **THEN** a aplicação SHALL disponibilizar endpoints autenticados para consulta,
  criação e atualização dos palpites do usuário logado

#### Scenario: Inicialização com logs de progresso

- **WHEN** o backend for iniciado em modo de desenvolvimento
- **THEN** o processo SHALL registrar etapas principais de bootstrap ou mensagens
  periódicas enquanto a compilação/watch ainda não estiver pronta

#### Scenario: Execução compilada sem watch

- **WHEN** o backend já estiver compilado
- **THEN** o projeto SHALL permitir iniciar `dist/main` sem recompilar nem
  observar arquivos

### Requirement: Frontend Next.js executável

O sistema SHALL disponibilizar uma aplicação frontend Next.js com TypeScript,
uma página inicial renderizável, URL do backend configurável por ambiente e uma
organização inicial para código reutilizável de API, autenticação e features.

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

#### Scenario: Organização inicial do frontend

- **WHEN** o frontend consumir APIs autenticadas
- **THEN** chamadas HTTP, armazenamento de sessão e funções de autenticação SHALL
  ficar em arquivos reutilizáveis fora de `pages/index.tsx`

#### Scenario: Tela protegida de dados da Copa

- **WHEN** o servidor frontend estiver em execução e a rota protegida da Copa for
  acessada
- **THEN** uma página SHALL exigir sessão local antes de renderizar dados de
  grupos, seleções e jogos consumidos da API configurada

#### Scenario: Tela protegida de palpites

- **WHEN** o servidor frontend estiver em execução e a rota protegida de palpites
  for acessada
- **THEN** uma página SHALL exigir sessão local antes de permitir consulta,
  criação ou atualização de palpites consumindo a API configurada

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação e a compatibilidade da toolchain e da versão TypeORM adotada,
incluindo configuração, autenticação, dados autenticados da Copa, palpites e
health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** build, migration, rollback, seed, unicidade e fluxo autenticado de
  palpites, configuração, autenticação, health check, rotas básicas e dados
  autenticados da Copa SHALL ser validados em um banco isolado
