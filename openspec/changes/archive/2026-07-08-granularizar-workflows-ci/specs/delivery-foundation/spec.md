## MODIFIED Requirements

### Requirement: Integração contínua

O repositório SHALL executar o contrato de qualidade automaticamente em pushes e
pull requests, SHALL expor checks técnicos granulares por responsabilidade,
SHALL validar metadados de pull requests em um fluxo dedicado e SHALL instalar a
toolchain sem ignorar incompatibilidades de dependências.

#### Scenario: Validação técnica de push

- **WHEN** uma branch receber push
- **THEN** a CI SHALL executar checks técnicos granulares para formatação, lint,
  build, governança, cobertura, integração e auditoria

#### Scenario: Validação técnica de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar checks técnicos granulares para formatação, lint,
  build, governança, cobertura, integração e auditoria

#### Scenario: Validação de metadados de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar o check `Metadata` validando nome da branch e
  título do pull request

#### Scenario: Metadados não executam em push

- **WHEN** uma branch receber push fora do evento de pull request
- **THEN** a CI SHALL NOT apresentar um check `Metadata` ignorado por condição
  de evento

#### Scenario: Integração usa PostgreSQL isolado

- **WHEN** os checks técnicos forem executados
- **THEN** apenas o check de integração SHALL declarar PostgreSQL como service
  container

#### Scenario: Cobertura e auditoria visíveis

- **WHEN** os checks técnicos forem exibidos no pull request
- **THEN** cobertura unitária e auditoria de dependências SHALL aparecer como
  checks próprios

### Requirement: Governança dos workflows de CI

O projeto SHALL manter testes automatizados que protejam a estrutura esperada
dos workflows de CI versionados.

#### Scenario: Workflows de CI verificáveis

- **WHEN** os testes de governança forem executados
- **THEN** eles SHALL validar que os workflows de metadados e validação técnica
  existem, usam os eventos esperados e executam os comandos críticos definidos
  pelo contrato de entrega

#### Scenario: Jobs técnicos verificáveis

- **WHEN** os testes de governança forem executados
- **THEN** eles SHALL validar os nomes dos checks técnicos granulares e seus
  comandos críticos
