## Why

O projeto está prestes a receber seu primeiro commit e ainda não possui um
contrato explícito para branches, mensagens de commit, pull requests e releases.
Definir e automatizar essas regras agora evita histórico inconsistente e reduz
atrito conforme novas funcionalidades forem adicionadas.

## What Changes

- Adotar trunk-based development com `main` estável e branches curtas.
- Padronizar nomes de branches e mensagens/títulos pelo Conventional Commits.
- Definir o fluxo OpenSpec → branch → pull request → squash merge.
- Documentar critérios de revisão, merge, versionamento SemVer e proteção da
  branch principal.
- Validar mensagens de commit localmente com Commitlint.
- Validar nomes de branch e títulos de pull request no GitHub Actions.
- Ampliar o template de pull request com rastreabilidade e checklist de
  governança.

## Capabilities

### New Capabilities

- `version-control-governance`: Estratégia de branches, commits, pull requests,
  merges, releases e validações automatizadas do fluxo Git.

### Modified Capabilities

- `delivery-foundation`: Incorporar as verificações de governança ao contrato de
  integração contínua e ao fluxo de contribuição.

## Impact

- `CONTRIBUTING.md` e template de pull request.
- Workflow do GitHub Actions e scripts npm.
- Hooks Husky e configuração do Commitlint.
- Dependências de desenvolvimento e lockfile.
- Specs OpenSpec de entrega e governança.
