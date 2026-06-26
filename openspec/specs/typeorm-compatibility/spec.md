# TypeORM Compatibility Specification

## Purpose

Definir os contratos de compatibilidade, migração e validação do TypeORM usado
pelo backend, incluindo integração NestJS, DataSource, CLI, migrations e seed.

## Requirements

### Requirement: Compatibilidade TypeORM versionada

O projeto SHALL adotar TypeORM 1.0 somente quando a árvore de dependências for
instalável de forma reproduzível e compatível com NestJS, sem ignorar peer
dependencies.

#### Scenario: Instalação compatível

- **WHEN** `npm ci` for executado após a atualização para TypeORM 1.0
- **THEN** a instalação SHALL concluir sem `--force`, `--legacy-peer-deps` ou
  overrides que mascarem incompatibilidade

#### Scenario: Bloqueio de compatibilidade

- **WHEN** TypeORM 1.0 não for compatível com dependências essenciais do projeto
- **THEN** a atualização SHALL ser revertida ou adiada com evidência documentada
  na issue relacionada

### Requirement: CLI TypeORM operacional

O backend SHALL manter comandos de migration e seed operacionais com a versão
TypeORM adotada.

#### Scenario: Migration run

- **WHEN** `npm run migration:run --workspace=backend` for executado com
  PostgreSQL disponível
- **THEN** a migration inicial SHALL criar o schema esperado sem erros

#### Scenario: Migration rollback

- **WHEN** `npm run migration:revert --workspace=backend` for executado após uma
  migration aplicada
- **THEN** as tabelas criadas pela migration SHALL ser removidas sem erros

#### Scenario: Seed

- **WHEN** `npm run seed --workspace=backend` for executado após a migration
- **THEN** grupos, seleções e jogos iniciais SHALL ser persistidos

### Requirement: Entidades e schema preservados

Entidades, decorators e metadata SHALL continuar representando o schema inicial
sem drift funcional involuntário.

#### Scenario: Build com entidades

- **WHEN** o backend for compilado
- **THEN** entidades TypeORM, decorators e metadata SHALL compilar sem erros

#### Scenario: Unicidade de palpites

- **WHEN** houver tentativa de inserir dois palpites para o mesmo usuário e jogo
- **THEN** o banco SHALL rejeitar o segundo registro pela restrição única

### Requirement: Evidência de migração

O resultado da avaliação/migração TypeORM SHALL ser documentado para rastrear a
decisão tomada.

#### Scenario: Migração concluída

- **WHEN** TypeORM 1.0 for adotado com sucesso
- **THEN** README, OpenSpec e issue #9 SHALL registrar validações executadas e
  eventuais ajustes necessários

#### Scenario: Migração bloqueada

- **WHEN** a adoção de TypeORM 1.0 for bloqueada
- **THEN** OpenSpec e issue #9 SHALL registrar causa, evidência e condição de
  retomada
