## 1. Contrato de qualidade

- [x] 1.1 Adicionar scripts raiz para format check, lint, build, testes, auditoria e CI agregada.
- [x] 1.2 Ajustar os scripts dos workspaces para checks não destrutivos usados pela CI.

## 2. Configuração e saúde

- [x] 2.1 Implementar validação tipada das variáveis de ambiente do backend.
- [x] 2.2 Configurar porta e CORS por ambiente e externalizar a URL da API no frontend.
- [x] 2.3 Implementar `GET /health` com verificação real do PostgreSQL.
- [x] 2.4 Ampliar a suíte de integração para configuração e health check.

## 3. Contêineres

- [x] 3.1 Adicionar Dockerfiles multi-stage para backend e frontend.
- [x] 3.2 Adicionar `.dockerignore` e healthcheck do PostgreSQL no Docker Compose.
- [x] 3.3 Validar o build das duas imagens.

## 4. Automação do repositório

- [x] 4.1 Adicionar workflow GitHub Actions com Node 24, PostgreSQL 15 e contrato de CI.
- [x] 4.2 Configurar Dependabot para npm e GitHub Actions.
- [x] 4.3 Adicionar `.editorconfig`, guia de contribuição e template de pull request.

## 5. Documentação e validação

- [x] 5.1 Atualizar README e exemplos de ambiente com os novos fluxos.
- [x] 5.2 Executar localmente todos os checks equivalentes à CI.

## 6. Prioridade média

- [x] 6.1 Aplicar cabeçalhos HTTP seguros e remover identificação do framework.
- [x] 6.2 Expor documentação OpenAPI controlada por variável de ambiente.
- [x] 6.3 Adicionar correlação e logs básicos de requisições.
- [x] 6.4 Configurar Husky e lint-staged para checks rápidos antes do commit.
- [x] 6.5 Adicionar testes unitários com limiares mínimos de cobertura.
- [x] 6.6 Atualizar documentação, testes de integração e contrato de CI.
