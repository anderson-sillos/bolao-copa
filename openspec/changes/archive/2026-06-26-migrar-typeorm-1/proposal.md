## Why

O Dependabot propôs a migração de TypeORM `0.3.30` para `1.0.0`, que já aparece
como versão `latest` no npm. A mudança é uma major release e pode afetar
integração com NestJS, DataSource, CLI de migrations, entidades, seed e a suíte
de fundação; por isso precisa ser tratada de forma planejada e validada.

## What Changes

- Avaliar as breaking changes oficiais do TypeORM 1.0 e mapear impacto no
  backend.
- Validar a compatibilidade real entre `@nestjs/typeorm` e TypeORM 1.0, sem
  usar `--force` ou `--legacy-peer-deps`.
- Atualizar TypeORM e ferramentas relacionadas somente se a árvore de
  dependências for compatível.
- Ajustar DataSource, scripts de CLI, entidades, migrations e seed quando
  necessário.
- Preservar o contrato atual de migrations, rollback, seed, health check,
  unicidade de palpites e execução da CI.
- Se houver bloqueio de compatibilidade, documentar a evidência, manter a versão
  atual e registrar o plano de retomada.
- Não alterar o modelo de dados funcional do bolão nesta change, salvo ajuste
  estritamente necessário para compatibilidade.

## Capabilities

### New Capabilities

- `typeorm-compatibility`: Contratos de compatibilidade, migração e validação do
  TypeORM, incluindo integração NestJS, DataSource, CLI, migrations e seed.

### Modified Capabilities

- `project-foundation`: Reforçar que a fundação executável deve permanecer
  compatível com a versão TypeORM adotada.
- `delivery-foundation`: Reforçar que a CI deve detectar incompatibilidades de
  dependências e regressões de persistência.

## Impact

- Dependências e lockfile da raiz/backend.
- `apps/backend/src/data-source.ts`.
- `apps/backend/src/app.module.ts`.
- Entidades TypeORM em `apps/backend/src/entities`.
- Migration inicial e scripts `migration:*`.
- Seed e importação de dados iniciais.
- Suíte `test:foundation`, cobertura unitária quando aplicável, Docker e CI.
- README/CONTRIBUTING se houver mudança operacional.
- Issue relacionada: #9.
