## Why

A fundação funcional do projeto já existe, mas a qualidade ainda depende de
execuções manuais e a aplicação não oferece contratos operacionais básicos para
ambientes automatizados. Esta mudança cria uma base reproduzível de integração
contínua, configuração, observabilidade e empacotamento antes do crescimento das
funcionalidades.

## What Changes

- Adicionar scripts raiz padronizados para format check, lint, build, testes e
  auditoria.
- Adicionar CI para validar pull requests e pushes com Node, PostgreSQL e os
  checks da fundação.
- Validar variáveis de ambiente do backend na inicialização.
- Configurar CORS e URL pública da API por ambiente.
- Adicionar health check da aplicação e do PostgreSQL.
- Adicionar Dockerfiles para frontend e backend, `.dockerignore` e healthcheck
  no Docker Compose.
- Adicionar automação de atualização de dependências e arquivos básicos de
  colaboração do repositório.
- Adicionar proteção de cabeçalhos HTTP, documentação OpenAPI e correlação
  básica de requisições no backend.
- Adicionar hooks locais para validar arquivos staged e uma suíte unitária com
  limiares mínimos de cobertura.
- Não adicionar deploy automático: o provedor e a estratégia de release ainda
  não foram definidos.

## Capabilities

### New Capabilities

- `delivery-foundation`: Integração contínua, scripts de qualidade, validação de
  ambiente, health checks, imagens Docker e governança básica do repositório.

### Modified Capabilities

- `project-foundation`: Tornar a configuração de runtime explícita e expor um
  health check verificável pela suíte da fundação.

## Impact

- Workflows e configurações na raiz do repositório.
- Inicialização e rotas do backend NestJS.
- Configuração do frontend Next.js.
- Docker Compose e novos Dockerfiles.
- Scripts npm, testes de integração e documentação de contribuição.
- Inicialização HTTP, logs de requisição e documentação da API.
