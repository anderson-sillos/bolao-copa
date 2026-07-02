# Project Foundation Specification

## Purpose

Definir a fundação executável do projeto Bolão da Copa, incluindo organização do
monorepo, aplicações backend e frontend, persistência PostgreSQL, dados iniciais
e verificação automatizada.

## Requirements

### Requirement: Estrutura de monorepo

O projeto SHALL usar npm workspaces para gerenciar as aplicações frontend e
backend sob o diretório `apps`.

#### Scenario: Instalação pela raiz

- **WHEN** as dependências forem instaladas na raiz do repositório
- **THEN** os workspaces `apps/backend` e `apps/frontend` SHALL ser reconhecidos

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

#### Scenario: Inicialização com logs de progresso

- **WHEN** o backend for iniciado em modo de desenvolvimento
- **THEN** o processo SHALL registrar etapas principais de bootstrap ou mensagens
  periódicas enquanto a compilação/watch ainda não estiver pronta

#### Scenario: Execução compilada sem watch

- **WHEN** o backend já estiver compilado
- **THEN** o projeto SHALL permitir iniciar `dist/main` sem recompilar nem
  observar arquivos

### Requirement: Conexão PostgreSQL configurável

O backend SHALL configurar e validar a conexão PostgreSQL por variáveis de
ambiente usando a versão TypeORM adotada. A aplicação NestJS, a CLI de
migrations e o seed SHALL usar uma estratégia de ambiente compatível. A origem
permitida pelo CORS e a porta HTTP SHALL ser configuráveis por ambiente.

#### Scenario: Inicialização com credenciais válidas

- **WHEN** o PostgreSQL estiver disponível e as variáveis de ambiente forem válidas
- **THEN** aplicação, migrations e seed SHALL estabelecer conexão com o banco

#### Scenario: Inicialização com configuração inválida

- **WHEN** uma variável obrigatória estiver ausente ou possuir formato inválido
- **THEN** o backend SHALL falhar antes de aceitar requisições

### Requirement: Modelo de dados inicial

O banco SHALL representar usuários, grupos, seleções, jogos e palpites com UUIDs,
relações e restrições de unicidade descritas na proposta. Usuários SHALL possuir
e-mail único e senha armazenada como hash. As seleções SHALL usar códigos FIFA
de três letras e armazenar o código visual da bandeira no campo
`flag_icon_code`.

#### Scenario: Criação das tabelas

- **WHEN** a migração inicial for executada em um banco vazio
- **THEN** as tabelas `users`, `groups`, `teams`, `games` e `bets` SHALL ser criadas

#### Scenario: Um palpite por usuário e jogo

- **WHEN** houver tentativa de inserir dois palpites para o mesmo usuário e jogo
- **THEN** o banco SHALL rejeitar o segundo registro pela restrição única

#### Scenario: Usuário com e-mail único

- **WHEN** houver tentativa de criar dois usuários com o mesmo e-mail normalizado
- **THEN** o banco ou a camada de serviço SHALL rejeitar o segundo registro

### Requirement: Carga de dados iniciais

O backend SHALL fornecer um script de seed para popular grupos, seleções e jogos
a partir de uma fonte estática. Jogos com placar conhecido SHALL persistir
`score_a` e `score_b`; jogos decididos por pênaltis SHALL persistir
`penalty_score_a` e `penalty_score_b`. Jogos ainda sem seleções definidas SHALL
ser persistidos com `team_a_id` e/ou `team_b_id` nulos.

#### Scenario: Execução do seed

- **WHEN** o seed for executado após a migração
- **THEN** grupos, seleções e jogos iniciais SHALL ser persistidos

#### Scenario: Jogos com placar conhecido

- **WHEN** um jogo do seed possuir placar final conhecido
- **THEN** o jogo SHALL ser persistido com `score_a` e `score_b`

#### Scenario: Jogos decididos por pênaltis

- **WHEN** um jogo do seed possuir decisão por pênaltis
- **THEN** o jogo SHALL ser persistido com `penalty_score_a` e
  `penalty_score_b`

#### Scenario: Jogos com seleções pendentes

- **WHEN** um jogo do seed ainda não possuir uma ou ambas as seleções definidas
- **THEN** o jogo SHALL ser persistido com as referências ausentes como `NULL`

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

### Requirement: Política de organização de páginas e componentes

O frontend SHALL manter páginas de rota enxutas e delegar UI, estado e lógica de
caso de uso para componentes organizados por feature ou por uso compartilhado.

#### Scenario: Página de rota enxuta

- **WHEN** uma nova página for criada em `apps/frontend/pages`
- **THEN** o arquivo da rota SHALL atuar principalmente como ponto de composição
  e navegação, evitando concentrar layout extenso, estado de formulário,
  chamadas de API e tratamento de erro no mesmo arquivo

#### Scenario: Componentes organizados por feature

- **WHEN** uma página precisar de UI, estado ou lógica reutilizável de uma área
  funcional
- **THEN** esses elementos SHALL ficar em `apps/frontend/src/features/<feature>/`
  quando forem específicos da feature, ou em `apps/frontend/src/components/`
  quando forem componentes compartilhados sem regra de negócio

#### Scenario: Componentes compartilhados entre telas

- **WHEN** duas ou mais páginas usarem estrutura visual, campos, alertas ou
  padrões de interação equivalentes
- **THEN** o frontend SHALL extrair componentes compartilhados para
  `apps/frontend/src/components/ui/` ou `apps/frontend/src/components/layout/`
  antes de duplicar implementação entre as páginas

#### Scenario: Promoção de componente de feature para compartilhado

- **WHEN** um componente criado dentro de `apps/frontend/src/features/<feature>/`
  deixar de depender da semântica daquela feature
- **THEN** o componente SHALL ser promovido para `apps/frontend/src/components/`
  antes de ser reutilizado por outras features

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação e a compatibilidade da toolchain e da versão TypeORM adotada,
incluindo configuração, autenticação, dados autenticados da Copa e health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** build, migration, rollback, seed, unicidade de palpites, configuração,
  autenticação, health check, rotas básicas e dados autenticados da Copa SHALL
  ser validados em um banco isolado
