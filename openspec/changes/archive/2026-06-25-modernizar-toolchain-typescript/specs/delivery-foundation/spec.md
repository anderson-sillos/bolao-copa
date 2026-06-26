## MODIFIED Requirements

### Requirement: Contrato de qualidade na raiz

O projeto SHALL fornecer comandos na raiz para formatação, lint por flat config,
build, testes e execução agregada da validação contínua.

#### Scenario: Execução local do contrato de CI

- **WHEN** o comando agregado de CI for executado na raiz
- **THEN** formatação, lint com a toolchain modernizada, builds, testes e
  auditoria SHALL ser executados

### Requirement: Integração contínua

O repositório SHALL executar o contrato de qualidade automaticamente em pushes e
pull requests, SHALL validar os metadados de controle de versão e SHALL instalar
a toolchain sem ignorar incompatibilidades.

#### Scenario: Validação de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar `npm ci`, validar branch e título e executar todos
  os checks com PostgreSQL disponível

### Requirement: Verificação local antes do commit

O projeto SHALL configurar hooks locais que validem arquivos staged e mensagens
de commit usando as mesmas regras de formatação e lint da CI.

#### Scenario: Commit com arquivos suportados

- **WHEN** um commit incluir arquivos JavaScript, TypeScript, JSON, Markdown ou
  YAML
- **THEN** lint-staged SHALL executar os checks compatíveis com a flat config

#### Scenario: Mensagem de commit

- **WHEN** uma mensagem de commit for criada
- **THEN** Commitlint SHALL validá-la antes da conclusão do commit
