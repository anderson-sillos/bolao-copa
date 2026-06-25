# Delivery Foundation Specification

## Purpose

Definir os contratos de qualidade, integração contínua, configuração,
observabilidade básica, empacotamento e colaboração que sustentam a entrega
segura do projeto.

## Requirements

### Requirement: Contrato de qualidade na raiz

O projeto SHALL fornecer comandos na raiz para formatação, lint, build, testes e
execução agregada da validação contínua.

#### Scenario: Execução local do contrato de CI

- **WHEN** o comando agregado de CI for executado na raiz
- **THEN** formatação, lint, builds, testes e auditoria SHALL ser executados

### Requirement: Integração contínua

O repositório SHALL executar o contrato de qualidade automaticamente em pushes e
pull requests.

#### Scenario: Validação de pull request

- **WHEN** um pull request for aberto ou atualizado
- **THEN** a CI SHALL instalar dependências reproduzivelmente e executar todos os
  checks com PostgreSQL disponível

### Requirement: Configuração validada

O backend SHALL validar variáveis obrigatórias e formatos antes de iniciar.

#### Scenario: Configuração inválida

- **WHEN** uma variável obrigatória estiver ausente ou inválida
- **THEN** o backend SHALL encerrar com mensagem indicando a configuração
  problemática

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

O repositório SHALL documentar o fluxo mínimo de contribuição e os checks
obrigatórios.

#### Scenario: Preparação de uma contribuição

- **WHEN** uma pessoa consultar o guia de contribuição
- **THEN** ela SHALL encontrar instruções de setup, branch, validação e pull
  request

### Requirement: Proteção HTTP básica

O backend SHALL aplicar cabeçalhos HTTP seguros e remover identificação
desnecessária do framework.

#### Scenario: Resposta da API

- **WHEN** uma rota HTTP do backend responder
- **THEN** a resposta SHALL incluir os cabeçalhos de proteção configurados

### Requirement: Documentação OpenAPI configurável

O backend SHALL gerar uma especificação OpenAPI e SHALL permitir habilitar sua
exposição por ambiente.

#### Scenario: Documentação habilitada

- **WHEN** `API_DOCS_ENABLED` estiver habilitada
- **THEN** a interface e o documento JSON OpenAPI SHALL estar disponíveis

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

O projeto SHALL configurar hooks locais que validem arquivos staged sem
substituir a CI.

#### Scenario: Commit com arquivos suportados

- **WHEN** um commit incluir arquivos JavaScript, TypeScript, JSON, Markdown ou
  YAML
- **THEN** lint-staged SHALL executar os checks rápidos configurados

### Requirement: Cobertura unitária mínima

O projeto SHALL disponibilizar testes unitários com relatório de cobertura e
limiares mínimos executados pela CI.

#### Scenario: Contrato de cobertura

- **WHEN** o comando de cobertura unitária for executado
- **THEN** ele SHALL falhar caso os limiares configurados não sejam atingidos
