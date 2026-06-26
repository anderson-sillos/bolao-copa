# TypeScript Toolchain Specification

## Purpose

Definir os contratos de compatibilidade da toolchain TypeScript, ESLint,
Prettier e carregamento de ambiente usados pelo monorepo.

## Requirements

### Requirement: ESLint flat config

O projeto SHALL usar flat config compatível com ESLint 10 para validar código
TypeScript, JavaScript e arquivos CommonJS mantidos no monorepo.

#### Scenario: Lint da raiz

- **WHEN** `npm run lint` for executado
- **THEN** backend e frontend SHALL ser analisados sem depender de
  `.eslintrc.json`

#### Scenario: Arquivos staged

- **WHEN** um commit incluir arquivos suportados pelo lint-staged
- **THEN** os checks SHALL usar a mesma configuração flat aplicada pela CI

### Requirement: Ecossistema ESLint compatível

ESLint, TypeScript ESLint e Prettier SHALL possuir versões mutuamente
compatíveis e instaláveis sem ignorar peer dependencies.

#### Scenario: Instalação reproduzível

- **WHEN** `npm ci` for executado em um checkout limpo
- **THEN** a árvore de dependências SHALL ser resolvida sem `--force` ou
  `--legacy-peer-deps`

### Requirement: Compilação TypeScript modernizada

O monorepo SHALL compilar com TypeScript 6 ou SHALL registrar um bloqueio
comprovado caso uma dependência essencial ainda não seja compatível.

#### Scenario: Builds dos workspaces

- **WHEN** os builds do backend e frontend forem executados
- **THEN** ambos SHALL compilar com verificação estrita e sem erros

#### Scenario: Decorators e seed JSON

- **WHEN** o backend for compilado e o seed executado
- **THEN** metadata de decorators e importação do arquivo JSON SHALL continuar
  funcionando

### Requirement: Carregamento de ambiente da CLI

Comandos TypeORM e seed SHALL carregar variáveis de ambiente de forma explícita
e reproduzível.

#### Scenario: Execução local com arquivo de ambiente

- **WHEN** migration ou seed forem executados com o arquivo `.env` documentado
- **THEN** a conexão PostgreSQL SHALL receber as configurações esperadas

#### Scenario: Execução automatizada

- **WHEN** migration ou seed receberem variáveis pelo ambiente da CI
- **THEN** essas variáveis SHALL prevalecer sem depender de configuração local

### Requirement: Decisão sobre dotenv

O projeto SHALL manter `dotenv` apenas se ele continuar necessário para o
carregamento de ambiente da CLI; caso contrário, SHALL removê-lo.

#### Scenario: Dependência necessária

- **WHEN** a CLI não possuir alternativa nativa equivalente e portátil
- **THEN** dotenv SHALL ser atualizado para uma versão compatível e testada

#### Scenario: Dependência redundante

- **WHEN** Node e os scripts fornecerem carregamento equivalente em todos os
  ambientes suportados
- **THEN** dotenv SHALL ser removido do manifesto e do código
