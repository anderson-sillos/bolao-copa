# Delivery Foundation Specification

## Purpose

Definir os contratos de qualidade, integração contínua, configuração,
observabilidade básica, empacotamento e colaboração que sustentam a entrega
segura do projeto.

## Requirements

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
a toolchain sem ignorar incompatibilidades de dependências.

#### Scenario: Validação de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL executar `npm ci`, validar branch e título e executar todos
  os checks com PostgreSQL disponível

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

### Requirement: Health check operacional

O backend SHALL expor um endpoint de saúde que verifique aplicação e PostgreSQL.

#### Scenario: Aplicação e banco saudáveis

- **WHEN** `GET /health` for acessado com o PostgreSQL disponível
- **THEN** o endpoint SHALL responder sucesso e indicar estado saudável

#### Scenario: Banco indisponível

- **WHEN** `GET /health` for acessado sem conexão funcional com o PostgreSQL
- **THEN** o endpoint SHALL responder com status de falha

### Requirement: Imagens Docker reproduzíveis

Frontend e backend SHALL possuir imagens Docker próprias e o Compose SHALL
declarar healthcheck para o PostgreSQL.

#### Scenario: Build das imagens

- **WHEN** as imagens do frontend e backend forem construídas
- **THEN** ambas SHALL concluir o build usando os arquivos versionados

### Requirement: Atualização automatizada de dependências

O repositório SHALL configurar atualizações automáticas para npm e GitHub
Actions.

#### Scenario: Verificação periódica

- **WHEN** existirem atualizações elegíveis
- **THEN** a automação SHALL propor alterações versionadas para revisão

### Requirement: Guia de contribuição

O repositório SHALL documentar setup, branches, commits, pull requests, merges,
releases e os checks obrigatórios.

#### Scenario: Preparação de uma contribuição

- **WHEN** uma pessoa consultar o guia de contribuição
- **THEN** ela SHALL encontrar o fluxo completo desde a criação da branch até o
  squash merge e o versionamento de releases

### Requirement: Proteção HTTP básica

O backend SHALL aplicar cabeçalhos HTTP seguros e remover identificação
desnecessária do framework.

#### Scenario: Resposta da API

- **WHEN** uma rota HTTP do backend responder
- **THEN** a resposta SHALL incluir os cabeçalhos de proteção configurados

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

### Requirement: Correlação de requisições

O backend SHALL associar um identificador a cada requisição e registrar dados
operacionais básicos da resposta.

#### Scenario: Requisição sem identificador

- **WHEN** uma requisição não fornecer `X-Request-Id`
- **THEN** o backend SHALL gerar um identificador, devolvê-lo na resposta e
  usá-lo no log da requisição

#### Scenario: Requisição com identificador

- **WHEN** uma requisição fornecer um `X-Request-Id` válido
- **THEN** o backend SHALL preservar e devolver esse identificador

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

### Requirement: Cobertura unitária mínima

O projeto SHALL disponibilizar testes unitários com relatório de cobertura e
limiares mínimos executados pela CI.

#### Scenario: Contrato de cobertura

- **WHEN** o comando de cobertura unitária for executado
- **THEN** ele SHALL falhar caso os limiares configurados não sejam atingidos
