## MODIFIED Requirements

### Requirement: Integração contínua

O repositório SHALL executar o contrato de qualidade automaticamente em pushes e
pull requests, SHALL validar os metadados de controle de versão e SHALL instalar
a toolchain sem ignorar incompatibilidades de dependências.

#### Scenario: Validação de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar `npm ci`, validar branch e título e executar todos
  os checks com PostgreSQL disponível
