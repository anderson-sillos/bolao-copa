## ADDED Requirements

### Requirement: Estratégia de branches

O projeto SHALL manter `main` como única branch permanente e SHALL usar branches
curtas com prefixos aprovados para mudanças.

#### Scenario: Branch de funcionalidade

- **WHEN** uma funcionalidade for iniciada
- **THEN** sua branch SHALL partir da `main` e usar o formato `feat/<slug>`

#### Scenario: Branch inválida em pull request

- **WHEN** um pull request usar uma branch fora dos formatos aprovados
- **THEN** a validação de metadados SHALL falhar

### Requirement: Conventional Commits

O projeto SHALL usar Conventional Commits nas mensagens destinadas ao histórico
e nos títulos de pull request.

#### Scenario: Commit local inválido

- **WHEN** uma mensagem de commit não respeitar a convenção configurada
- **THEN** o hook `commit-msg` SHALL rejeitar o commit

#### Scenario: Título de pull request inválido

- **WHEN** o título de um pull request não respeitar Conventional Commits
- **THEN** a validação de metadados SHALL falhar

### Requirement: Fluxo de pull request

Mudanças na `main` SHALL passar por pull request com contexto, validação e
integração por squash merge.

#### Scenario: Pull request pronto para merge

- **WHEN** um pull request possuir descrição suficiente, checks aprovados e
  revisão aplicável
- **THEN** ele SHALL ser integrado por squash merge

### Requirement: Rastreabilidade OpenSpec

Mudanças relevantes de comportamento SHALL manter relação identificável com uma
change OpenSpec.

#### Scenario: Mudança funcional

- **WHEN** uma mudança funcional ou arquitetural for proposta
- **THEN** a branch ou o pull request SHALL referenciar a change OpenSpec
  correspondente

### Requirement: Versionamento de releases

O projeto SHALL usar SemVer e tags prefixadas com `v` para releases.

#### Scenario: Criação de release

- **WHEN** uma versão for publicada
- **THEN** sua tag SHALL seguir o formato `vMAJOR.MINOR.PATCH`
