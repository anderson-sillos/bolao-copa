# Proposta: Setup Inicial do Projeto e Modelos de Dados

## Objetivo

Criar a estrutura fundamental para o projeto "Bolão da Copa", estabelecendo um monorepo com um frontend em Next.js e um backend em NestJS. Esta change também define e prepara o banco de dados PostgreSQL com os modelos de dados iniciais.

## Detalhes da Implementação

### 1. Estrutura do Projeto (Monorepo)

Será criada uma estrutura de monorepo usando `npm workspaces` para gerenciar os dois projetos de forma coesa:

```
/
├── apps/
│   ├── frontend/ (Next.js)
│   └── backend/  (NestJS)
└── packages/
    └── (pacotes compartilhados, se necessário)
```

### 2. Backend (NestJS)

- **Setup Inicial:** Configurar um novo projeto NestJS.
- **Conexão com Banco de Dados:** Configurar a conexão com o PostgreSQL usando TypeORM.
- **Criação das Entidades:** Implementar as entidades iniciais baseadas nos modelos de dados abaixo.

### 3. Frontend (Next.js)

- **Setup Inicial:** Configurar um novo projeto Next.js com TypeScript.

### 4. Modelos de Dados (PostgreSQL)

Abaixo estão as definições iniciais para as tabelas do banco de dados.

#### Tabela: `users` (Usuários)

Armazena os dados dos usuários que participam do bolão.

- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Tabela: `groups` (Grupos)

Armazena os grupos da fase de grupos da copa.

- `id` (UUID, PK)
- `name` (VARCHAR, UNIQUE) - Ex: "A", "B", "C"...
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Tabela: `teams` (Seleções)

Armazena as informações das seleções que participam da copa.

- `id` (UUID, PK)
- `name` (VARCHAR, UNIQUE) - Ex: "Brasil"
- `country_code` (VARCHAR(3), UNIQUE) - Código FIFA, ex: "BRA"
- `flag_unicode` (VARCHAR) - Sequência ASCII de code points, ex: "U+1F1E7 U+1F1F7"
- `group_id` (UUID, FK para `groups.id`, NULLABLE)

#### Tabela: `games` (Jogos)

Armazena os jogos da copa.

- `id` (UUID, PK)
- `team_a_id` (UUID, FK para `teams.id`, NULLABLE)
- `team_b_id` (UUID, FK para `teams.id`, NULLABLE)
- `game_time` (TIMESTAMP) - Data e hora do jogo.
- `phase` (VARCHAR) - Ex: "fase_de_grupos", "oitavas", "quartas".
- `score_a` (INTEGER, NULLABLE) - Gols da seleção A (preenchido após o jogo).
- `score_b` (INTEGER, NULLABLE) - Gols da seleção B (preenchido após o jogo).

#### Tabela: `bets` (Palpites)

Armazena os palpites dos usuários para cada jogo.

- `id` (UUID, PK)
- `user_id` (UUID, FK para `users.id`)
- `game_id` (UUID, FK para `games.id`)
- `score_a` (INTEGER) - Palpite de gols para a seleção A.
- `score_b` (INTEGER) - Palpite de gols para a seleção B.
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- **Constraint:** UNIQUE(`user_id`, `game_id`) para garantir um palpite por usuário por jogo.

## Critérios de Aceite

- A estrutura do monorepo com os diretórios apps/frontend e apps/backend está criada e configurada com npm workspaces.
- O projeto backend (NestJS) é inicializado e a conexão com o PostgreSQL via TypeORM está configurada e funcionando.
- As migrações do TypeORM para as tabelas users, teams, games, e bets são geradas e podem ser executadas com sucesso.
- O projeto frontend (Next.js) é inicializado e renderiza uma página de placeholder.

## Estratégia de População de Dados

- As tabelas teams e games serão populadas inicialmente através de um script de seeding no NestJS. Os dados serão obtidos de uma fonte estática (ex: um arquivo JSON) para o escopo da Copa do Mundo de 2026. Jogos eliminatórios ainda sem seleções definidas serão persistidos com as referências de time nulas. A busca dinâmica de uma API externa não faz parte desta change.

## Fora do Escopo (Não-Objetivos)

- Implementação completa do sistema de autenticação (endpoints de login/registro). Apenas a estrutura da tabela users será criada.
- Implementação de qualquer regra de negócio para cálculo de pontos dos palpites.
- Criação de componentes de UI no frontend além da página inicial padrão.
- Configuração de pipeline de CI/CD.
