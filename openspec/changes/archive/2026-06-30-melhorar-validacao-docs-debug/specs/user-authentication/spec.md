## ADDED Requirements

### Requirement: Mensagens de validação localizadas

O backend SHALL retornar mensagens de validação de autenticação em português e
com vocabulário controlado pelo projeto, mesmo usando `class-validator`.

#### Scenario: E-mail inválido no login

- **WHEN** `POST /auth/login` receber e-mail em formato inválido
- **THEN** o backend SHALL rejeitar a requisição com mensagem em português para
  e-mail inválido

#### Scenario: E-mail inválido no cadastro

- **WHEN** `POST /auth/register` receber e-mail em formato inválido
- **THEN** o backend SHALL rejeitar a requisição com mensagem em português para
  e-mail inválido

#### Scenario: Mensagens centralizadas

- **WHEN** DTOs de autenticação declararem validações recorrentes
- **THEN** as mensagens SHALL ser obtidas de helpers ou decorators centralizados
  do projeto, evitando strings genéricas ou em inglês espalhadas pelos DTOs
