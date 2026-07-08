## Why

O workflow técnico atual executa todo o contrato em um único check `Validate`,
o que mantém a proteção da `main`, mas dificulta identificar rapidamente se uma
falha veio de formatação, lint, build, cobertura, integração ou auditoria.
Depois da separação do `Metadata`, o próximo ganho de CI/CD é tornar a esteira
mais diagnóstica sem alterar o contrato local principal.

## What Changes

- Dividir o workflow técnico em checks nomeados por responsabilidade:
  `Format`, `Lint`, `Build`, `Governance`, `Coverage`, `Foundation` e `Audit`.
- Manter `Metadata` como workflow exclusivo de pull request.
- Manter PostgreSQL apenas no job que precisa de integração com banco.
- Preservar `npm run ci` e `npm run ci:runner` como contratos agregados locais,
  sem exigir que o GitHub Actions rode tudo dentro de um único job.
- Atualizar testes de governança para proteger os jobs esperados e comandos
  críticos do workflow.
- Atualizar documentação de contribuição e checks obrigatórios esperados.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `delivery-foundation`: a integração contínua passa a expor checks técnicos
  granulares, com cobertura e auditoria visíveis individualmente.

## Impact

- `.github/workflows/validate.yml`
- `test/governance.test.cjs`
- `CONTRIBUTING.md`
- `openspec/specs/delivery-foundation/spec.md`
