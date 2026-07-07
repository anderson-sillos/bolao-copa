## MODIFIED Requirements

### Requirement: Integração contínua

O repositório SHALL executar o contrato de qualidade automaticamente em pushes e
pull requests, SHALL validar metadados de pull requests em um fluxo dedicado e
SHALL instalar a toolchain sem ignorar incompatibilidades de dependências.

#### Scenario: Validação técnica de push

- **WHEN** uma branch receber push
- **THEN** a CI SHALL executar o check `Validate` com `npm ci` e o contrato
  técnico aplicável

#### Scenario: Validação técnica de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar o check `Validate` com `npm ci`, PostgreSQL
  disponível e todos os checks técnicos do contrato de CI

#### Scenario: Validação de metadados de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar o check `Metadata` validando nome da branch e
  título do pull request

#### Scenario: Metadados não executam em push

- **WHEN** uma branch receber push fora do evento de pull request
- **THEN** a CI SHALL NOT apresentar um check `Metadata` ignorado por condição
  de evento

## ADDED Requirements

### Requirement: Governança dos workflows de CI

O projeto SHALL manter testes automatizados que protejam a estrutura esperada
dos workflows de CI versionados.

#### Scenario: Workflows de CI verificáveis

- **WHEN** os testes de governança forem executados
- **THEN** eles SHALL validar que os workflows de metadados e validação técnica
  existem, usam os eventos esperados e executam os comandos críticos definidos
  pelo contrato de entrega
