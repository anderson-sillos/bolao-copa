## MODIFIED Requirements

### Requirement: Documentação OpenAPI configurável

O backend SHALL gerar uma especificação OpenAPI, SHALL apresentar Swagger UI com
os endpoints carregados automaticamente, SHALL documentar o esquema de
autenticação bearer, SHALL respeitar a Content Security Policy configurada e
SHALL permitir habilitar sua exposição por ambiente.

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

#### Scenario: Swagger UI compatível com CSP

- **WHEN** `/docs` for aberta com a política `script-src 'self'`
- **THEN** a página SHALL carregar a Swagger UI sem exigir script inline,
  `unsafe-inline`, hash manual ou nonce específico

## ADDED Requirements

### Requirement: Debug local via WSL

O projeto SHALL fornecer configuração versionada do VS Code para iniciar e
anexar debug aos processos backend e frontend executados dentro do WSL.

#### Scenario: Debug do backend pelo VS Code

- **WHEN** a configuração `Backend: NestJS debug (WSL)` for iniciada
- **THEN** o backend SHALL ser executado pelo WSL e expor o Node Inspector para
  attach do VS Code

#### Scenario: Debug do frontend pelo VS Code

- **WHEN** a configuração `Frontend: Next.js debug (WSL)` for iniciada
- **THEN** o frontend SHALL ser executado pelo WSL e expor o Node Inspector para
  attach do VS Code

#### Scenario: Configurações compartilháveis

- **WHEN** a pasta `.vscode` contiver configurações locais do editor
- **THEN** apenas `launch.json` e `tasks.json` SHALL ser preparados para
  versionamento pelo projeto
