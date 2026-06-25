## MODIFIED Requirements

### Requirement: Integração contínua

O repositório SHALL executar o contrato de qualidade automaticamente em pushes e
pull requests e SHALL validar os metadados de controle de versão aplicáveis.

#### Scenario: Validação de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL instalar dependências reproduzivelmente, validar branch e
  título e executar todos os checks com PostgreSQL disponível

### Requirement: Guia de contribuição

O repositório SHALL documentar setup, branches, commits, pull requests, merges,
releases e os checks obrigatórios.

#### Scenario: Preparação de uma contribuição

- **WHEN** uma pessoa consultar o guia de contribuição
- **THEN** ela SHALL encontrar o fluxo completo desde a criação da branch até o
  squash merge e o versionamento de releases

### Requirement: Verificação local antes do commit

O projeto SHALL configurar hooks locais que validem arquivos staged e mensagens
de commit sem substituir a CI.

#### Scenario: Commit com arquivos suportados

- **WHEN** um commit incluir arquivos JavaScript, TypeScript, JSON, Markdown ou
  YAML
- **THEN** lint-staged SHALL executar os checks rápidos configurados

#### Scenario: Mensagem de commit

- **WHEN** uma mensagem de commit for criada
- **THEN** Commitlint SHALL validá-la antes da conclusão do commit
