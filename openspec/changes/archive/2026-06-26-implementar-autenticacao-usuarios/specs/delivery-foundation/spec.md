## MODIFIED Requirements

### Requirement: Configuração validada

O backend SHALL validar variáveis obrigatórias, formatos e segredos de
autenticação antes de iniciar.

#### Scenario: Configuração inválida

- **WHEN** uma variável obrigatória estiver ausente ou inválida
- **THEN** o backend SHALL encerrar com mensagem indicando a configuração
  problemática

#### Scenario: Segredo de autenticação inválido

- **WHEN** o segredo de autenticação estiver ausente ou abaixo da política mínima
- **THEN** o backend SHALL falhar antes de aceitar requisições

### Requirement: Documentação OpenAPI configurável

O backend SHALL gerar uma especificação OpenAPI, SHALL apresentar Swagger UI com
os endpoints carregados automaticamente, SHALL documentar o esquema de
autenticação bearer e SHALL permitir habilitar sua exposição por ambiente.

#### Scenario: Documentação habilitada

- **WHEN** `API_DOCS_ENABLED` estiver habilitada
- **THEN** a interface Swagger UI, o documento JSON OpenAPI e os contratos de
  autenticação SHALL estar disponíveis

#### Scenario: Swagger UI no browser

- **WHEN** a rota `/docs` for aberta no browser
- **THEN** Swagger UI SHALL carregar automaticamente a especificação de
  `/docs-json` e listar os endpoints da API

#### Scenario: Swagger UI reproduzível

- **WHEN** a aplicação for construída ou executada localmente
- **THEN** Swagger UI SHALL ser servido por dependência local do projeto sem
  depender de CDN em runtime
