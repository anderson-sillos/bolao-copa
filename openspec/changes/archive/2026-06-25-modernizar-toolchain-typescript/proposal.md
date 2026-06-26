## Why

O projeto usa ESLint 8 com configuração legada, TypeScript 5.5 e dotenv 16.
Atualizações automáticas recentes mostraram que essas ferramentas precisam
evoluir de forma coordenada para evitar conflitos, preservar a CI e manter
compatibilidade com NestJS, Next.js e os scripts TypeORM.

## What Changes

- Migrar ESLint para a versão 10 e substituir `.eslintrc.json` por flat config.
- Atualizar `@typescript-eslint/parser` e `@typescript-eslint/eslint-plugin` para
  versões compatíveis com ESLint 10.
- Avaliar e atualizar TypeScript para a versão 6, ajustando os `tsconfig` e
  ferramentas dependentes quando necessário.
- Avaliar a necessidade da dependência explícita `dotenv`; removê-la ou
  atualizá-la para a versão 17 conforme o uso real do backend.
- Atualizar scripts de lint, lint-staged, builds, migrations e testes afetados.
- Manter o contrato de CI, Docker e desenvolvimento local reproduzível.
- Não incluir a migração do TypeORM 1.0, que permanece em change separada.

## Capabilities

### New Capabilities

- `typescript-toolchain`: Compatibilidade e validação coordenada do compilador,
  ESLint flat config, TypeScript ESLint e carregamento de ambiente.

### Modified Capabilities

- `delivery-foundation`: Atualizar os contratos de lint, build, CI e hooks para
  a toolchain modernizada.
- `project-foundation`: Preservar execução do backend, frontend, migrations e
  seed sob TypeScript 6 e a estratégia atualizada de ambiente.

## Impact

- Dependências e lockfile da raiz e do backend.
- Configuração ESLint e scripts dos workspaces.
- `tsconfig` do backend e frontend.
- Carregamento de ambiente usado pelo TypeORM, migrations e seed.
- Lint-staged, CI, Dockerfiles, testes e documentação.
- Issues relacionadas: #14, #15 e #16.
