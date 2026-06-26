## Context

O monorepo usa ESLint 8 com `.eslintrc.json`, TypeScript 5.5 e
`@typescript-eslint` 7. O Dependabot comprovou que atualizações isoladas causam
conflitos de peer dependencies e que ESLint 10 exige flat config. O backend
também usa `dotenv` diretamente no DataSource executado pela CLI TypeORM.

## Goals / Non-Goals

**Goals:**

- Atualizar ESLint, TypeScript ESLint e TypeScript como conjunto compatível.
- Migrar para flat config sem reduzir as regras ou o escopo atual do lint.
- Preservar builds de NestJS e Next.js, decorators e importação de JSON.
- Preservar CLI TypeORM, migrations e seed com carregamento de ambiente
  explícito.
- Decidir por evidência se `dotenv` deve ser removido ou atualizado.
- Manter `npm ci`, lint-staged, Docker e GitHub Actions reproduzíveis.

**Non-Goals:**

- Migrar TypeORM para 1.0.
- Alterar o modelo de dados ou criar migrations.
- Converter o monorepo inteiro para ESM.
- Introduzir novas regras funcionais da aplicação.

## Decisions

### Atualização coordenada do ecossistema ESLint

ESLint, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` e
`eslint-config-prettier` serão tratados como conjunto. O flat config será
mantido na raiz e deverá cobrir ambos os workspaces, scripts e testes com
overrides apropriados para TypeScript e CommonJS.

A alternativa de manter ESLint 8 foi descartada porque posterga a migração
obrigatória e mantém ferramentas sem suporte.

### TypeScript 6 validado em todos os consumidores

A atualização será aceita somente se NestJS, Next.js, ts-node,
typeorm-ts-node-commonjs, decorators e importação do seed JSON continuarem
funcionando. Os `tsconfig` serão ajustados apenas quando uma opção tiver mudado
de significado ou sido removida.

### Decisão explícita para dotenv

O uso atual é direto em `src/data-source.ts`, necessário para comandos locais da
CLI que não inicializam o NestJS. Primeiro será verificado se Node 24 ou a CLI
existente oferecem carregamento equivalente e portátil. Se não oferecerem,
`dotenv` será atualizado para 17 e seu comportamento será testado; se
oferecerem, a dependência será removida e os scripts passarão a carregar o
arquivo explicitamente.

### Compatibilidade antes de limpeza

Configurações legadas só serão removidas após lint, build, migrations, seed,
testes e Docker passarem com a nova toolchain. O lockfile continuará versionado
e será regenerado por `npm install`/`npm ci`.

## Risks / Trade-offs

- [ESLint 10 mudar defaults e ignores] → Cobrir arquivos esperados em testes de
  governança e executar lint nos dois workspaces.
- [TypeScript 6 alterar decorators ou resolução de módulos] → Validar build e
  execução real do NestJS, Next.js, migrations e seed.
- [Remoção de dotenv quebrar a CLI] → Testar comandos com `.env` local e com
  variáveis fornecidas pelo ambiente antes de decidir.
- [Atualização conjunta dificultar diagnóstico] → Implementar em etapas com
  commits/checks separados dentro da mesma branch.
- [Dependências ainda não declararem suporte ao TypeScript 6] → Manter
  TypeScript 5.5 temporariamente e registrar o bloqueio, sem usar `--force` ou
  `--legacy-peer-deps`.

## Migration Plan

1. Criar branch a partir da `main` e capturar baseline dos checks.
2. Migrar ESLint para flat config e atualizar o ecossistema ESLint.
3. Atualizar TypeScript e ajustar os `tsconfig`.
4. Avaliar/remover ou atualizar dotenv.
5. Regenerar lockfile e validar instalação limpa.
6. Executar lint, builds, migrations, rollback, seed, testes, Docker e auditoria.
7. Atualizar documentação e fechar as issues #14, #15 e #16 após o merge.

Rollback: restaurar versões, `.eslintrc.json`, `tsconfig` e estratégia de dotenv
do commit anterior; não há alteração de dados.

## Open Questions

- Todas as dependências publicadas já aceitam TypeScript 6 sem override?
- O carregamento nativo de `.env` do Node 24 atende igualmente CLI local,
  testes, Docker e GitHub Actions?
