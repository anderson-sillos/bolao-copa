## Context

O backend usa NestJS com `@nestjs/typeorm`, TypeORM `^0.3.20`, PostgreSQL,
migration inicial manual, seed em `ts-node` e CLI via
`typeorm-ts-node-commonjs -d src/data-source.ts`. A versão `typeorm@1.0.0`
aparece como `latest` no npm, mas `@nestjs/typeorm@11.0.2` declara peer
dependency como `^0.3.0 || ^1.0.0-dev`, portanto a migração para `1.0.0` deve
ser comprovada por instalação limpa e execução real, não por suposição.

Pesquisa inicial em fontes oficiais:

- `typeorm@1.0.0` exige Node `^20.19.0 || ^22.13.0 || >=24.11.0`; o projeto usa
  Node `24.18.0`.
- `typeorm@1.0.0` declara peer `pg@^8.5.1`; o backend usa `pg@8.22.0`.
- O guia oficial informa que NestJS precisa de `@nestjs/typeorm` `11.0.1+` para
  compatibilidade com TypeORM v1; o backend usa `@nestjs/typeorm@11.0.2`.
- O pacote `typeorm@1.0.0` já expõe binários `typeorm`,
  `typeorm-ts-node-esm` e `typeorm-ts-node-commonjs`, o que pode tornar o pacote
  wrapper `typeorm-ts-node-commonjs` redundante.

A fundação atual já valida build, migrations, rollback, seed, health check,
rotas básicas e auditoria. Esta change deve preservar esse contrato e resolver
a issue #9 com evidência.

## Goals / Non-Goals

**Goals:**

- Revisar o guia oficial de migração TypeORM 0.3 → 1.0 e release notes
  aplicáveis.
- Confirmar a versão estável atual de TypeORM e a compatibilidade declarada das
  dependências NestJS.
- Atualizar TypeORM para 1.0 quando `npm install`/`npm ci` resolverem sem
  `--force` ou `--legacy-peer-deps`.
- Ajustar DataSource, CLI, scripts, entidades, migrations e seed apenas quando
  exigido pela versão adotada.
- Garantir migration, rollback, seed e suíte de fundação com PostgreSQL real.
- Atualizar documentação e fechar a issue #9 com o resultado.

**Non-Goals:**

- Alterar o modelo de dados funcional do bolão.
- Introduzir novas entidades ou APIs de produto.
- Trocar PostgreSQL, NestJS ou estratégia de migrations por outra biblioteca.
- Recriar migrations sem necessidade comprovada de compatibilidade.
- Aceitar instalação com peer dependencies ignoradas.

## Decisions

### Migração condicionada à compatibilidade instalada

Primeiro será feita uma tentativa controlada de atualização para `typeorm@1.0.0`
em branch da change. Se `npm install` ou `npm ci` falharem por peer dependency
ou incompatibilidade real, a change não deverá mascarar o problema com
`--force`, `--legacy-peer-deps` ou overrides amplos. Nesse caso, a issue #9 será
atualizada com evidência e o bloqueio ficará documentado.

Alternativa considerada: forçar a instalação para adaptar o código primeiro.
Foi descartada porque reduziria a confiabilidade da CI e criaria um estado
difícil de reproduzir.

### DataSource e CLI permanecem como ponto único para migrations e seed

`src/data-source.ts` continuará sendo a fonte para CLI TypeORM e seed, carregando
ambiente local antes de criar o `DataSource`. Ajustes serão feitos ali somente se
a API do TypeORM 1.0 exigir mudança.

Alternativa considerada: criar configuração separada para CLI e aplicação
NestJS. Foi descartada por enquanto para evitar divergência entre runtime,
migrations e seed.

### Preferir CLI publicada pelo TypeORM 1.0

Se `typeorm@1.0.0` executar corretamente o binário `typeorm-ts-node-commonjs`
incluído no próprio pacote, o wrapper externo `typeorm-ts-node-commonjs` deverá
ser removido para reduzir dependência legada. Se o binário próprio falhar, o
wrapper poderá ser mantido somente com evidência de necessidade.

### Validação por comportamento, não por diff de schema

A migração será aceita somente se a suíte provar o comportamento esperado:
build, migration, rollback, seed, unicidade de palpites, health check e rotas
básicas. Quando aplicável, também será executado `migration:generate --check`
para detectar drift involuntário de schema.

Alternativa considerada: aceitar a atualização apenas porque a aplicação compila.
Foi descartada porque TypeORM afeta execução real contra banco e geração de SQL.

### Escopo mínimo de compatibilidade

Mudanças em entidades, decorators, constraints, nomes de migrations e scripts
devem ser mínimas. Qualquer alteração de SQL gerado ou comportamento de schema
deve ser tratada como risco e documentada.

## Risks / Trade-offs

- [Peer dependency do `@nestjs/typeorm` não aceitar `typeorm@1.0.0` estável] →
  Não forçar instalação; registrar bloqueio e condição de retomada.
- [CLI `typeorm-ts-node-commonjs` não ser compatível com TypeORM 1.0] → Validar
  `migration:run`, `migration:revert` e `migration:generate`; substituir script
  apenas se houver alternativa oficial/compatível.
- [Mudança de metadata/decorators afetar entidades] → Executar build estrito,
  migrations e seed com PostgreSQL real.
- [Drift no schema gerado] → Comparar geração/check de migration quando possível
  e revisar SQL antes de aceitar.
- [Atualização passar localmente, mas falhar na CI] → Executar `npm run ci` e
  validar PR com GitHub Actions antes de merge.

## Migration Plan

1. Criar branch da change a partir da `main` limpa.
2. Registrar baseline com `npm ci`, lint, build, testes, foundation e auditoria.
3. Revisar guia oficial TypeORM 0.3 → 1.0 e mapear breaking changes relevantes.
4. Tentar atualizar TypeORM e dependências auxiliares necessárias sem ignorar
   peer dependencies.
5. Ajustar código/scripts conforme erros reais de build ou execução.
6. Executar validações locais: `npm ci`, `npm run lint`, `npm run build`,
   `npm run test:coverage`, `npm run test:foundation`, `npm run ci`,
   Docker build e auditoria.
7. Se compatível, atualizar documentação/specs, fechar #9 e abrir PR.
8. Se bloqueado, reverter atualização de dependências, documentar evidência,
   atualizar #9 e abrir PR de documentação do bloqueio se fizer sentido.

Rollback: restaurar `package.json`, `package-lock.json`, scripts e ajustes de
DataSource/entidades ao estado anterior; não há migração de dados planejada.

## Open Questions

- O peer range de `@nestjs/typeorm@11.0.2` aceita efetivamente `typeorm@1.0.0`
  estável em npm install limpo?
- O pacote `typeorm-ts-node-commonjs` continua sendo o caminho recomendado para
  CLI com TypeScript 6 e TypeORM 1.0?
- O TypeORM 1.0 altera SQL gerado para constraints, nullability ou timestamps
  das entidades atuais?
