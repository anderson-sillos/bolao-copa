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

O sistema SHALL disponibilizar uma aplicação backend NestJS compilável e
executável.

#### Scenario: Compilação do backend

- **WHEN** o comando de build do workspace backend for executado
- **THEN** a aplicação SHALL ser compilada sem erros

### Requirement: Conexão PostgreSQL configurável

O backend SHALL configurar e validar a conexão PostgreSQL por variáveis de
ambiente usando TypeORM. A origem permitida pelo CORS e a porta HTTP SHALL ser
configuráveis por ambiente.

#### Scenario: Inicialização com credenciais válidas

- **WHEN** o PostgreSQL estiver disponível e as variáveis de ambiente forem válidas
- **THEN** o backend SHALL iniciar, estabelecer a conexão com o banco e aplicar a
  configuração de porta e CORS

#### Scenario: Inicialização com configuração inválida

- **WHEN** uma variável obrigatória estiver ausente ou possuir formato inválido
- **THEN** o backend SHALL falhar antes de aceitar requisições

### Requirement: Modelo de dados inicial

O banco SHALL representar usuários, grupos, seleções, jogos e palpites com UUIDs,
relações e restrições de unicidade descritas na proposta. As seleções SHALL usar
códigos FIFA de três letras e armazenar a bandeira como sequência Unicode ASCII
no campo `flag_unicode`.

#### Scenario: Criação das tabelas

- **WHEN** a migração inicial for executada em um banco vazio
- **THEN** as tabelas `users`, `groups`, `teams`, `games` e `bets` SHALL ser criadas

#### Scenario: Um palpite por usuário e jogo

- **WHEN** houver tentativa de inserir dois palpites para o mesmo usuário e jogo
- **THEN** o banco SHALL rejeitar o segundo registro pela restrição única

### Requirement: Carga de dados iniciais

O backend SHALL fornecer um script de seed para popular grupos, seleções e jogos
a partir de uma fonte estática. Jogos ainda sem seleções definidas SHALL ser
persistidos com `team_a_id` e/ou `team_b_id` nulos.

#### Scenario: Execução do seed

- **WHEN** o seed for executado após a migração
- **THEN** grupos, seleções e jogos iniciais SHALL ser persistidos

#### Scenario: Jogos com seleções pendentes

- **WHEN** um jogo do seed ainda não possuir uma ou ambas as seleções definidas
- **THEN** o jogo SHALL ser persistido com as referências ausentes como `NULL`

### Requirement: Frontend Next.js executável

O sistema SHALL disponibilizar uma aplicação frontend Next.js com TypeScript,
uma página inicial renderizável e URL do backend configurável por ambiente.

#### Scenario: Build do frontend

- **WHEN** o comando de build do workspace frontend for executado
- **THEN** a aplicação SHALL ser compilada sem erros

#### Scenario: Página inicial

- **WHEN** o servidor frontend estiver em execução e a rota raiz for acessada
- **THEN** uma página inicial SHALL ser renderizada

#### Scenario: URL externa da API

- **WHEN** `NEXT_PUBLIC_API_URL` estiver configurada
- **THEN** o frontend SHALL usar esse valor para acessar o backend

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação, incluindo configuração e health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** migração, rollback, seed, unicidade de palpites, configuração, health
  check e rotas básicas SHALL ser validados em um banco isolado
