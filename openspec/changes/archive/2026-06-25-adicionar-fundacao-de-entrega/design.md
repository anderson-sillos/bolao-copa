## Context

O monorepo possui builds e testes de integração funcionais, porém sem uma
interface única de qualidade na raiz, sem CI e sem contratos operacionais para
configuração e saúde. A solução deve funcionar no desenvolvimento local, em
GitHub Actions e em imagens Docker sem acoplar o projeto a um provedor de deploy.

## Goals / Non-Goals

**Goals:**

- Executar checks reproduzíveis em cada pull request e push.
- Falhar cedo quando a configuração obrigatória do backend estiver inválida.
- Disponibilizar health check que inclua o PostgreSQL.
- Externalizar URL da API e origem de CORS.
- Produzir imagens Docker do frontend e backend.
- Automatizar atualizações de dependências e documentar contribuições.
- Aplicar uma proteção HTTP mínima e publicar documentação OpenAPI.
- Oferecer correlação de requisições e feedback rápido antes de commits.
- Medir a cobertura da lógica unitária mantida pelo projeto.

**Non-Goals:**

- Fazer deploy automático em staging ou produção.
- Definir provedor de nuvem, domínio ou estratégia de secrets de produção.
- Adicionar observabilidade externa, tracing ou agregador de logs.
- Impor convenção de mensagens de commit ou regras de propriedade sem um time
  definido.

## Decisions

### Scripts raiz como contrato da CI

A raiz exporá `format:check`, `lint`, `build`, `test` e `ci`. A CI chamará esses
scripts em vez de conhecer detalhes dos workspaces.

### GitHub Actions com PostgreSQL de serviço

O workflow usará Node 24, `npm ci` e um PostgreSQL 15 de serviço. A alternativa
de subir Docker Compose dentro do runner foi descartada porque o serviço nativo
oferece readiness e isolamento mais simples.

### Validação de ambiente sem nova biblioteca

Uma função TypeScript validará presença, formato e faixas das variáveis. Isso
evita uma dependência adicional para um conjunto pequeno de configurações.

### Health check com consulta real ao banco

`GET /health` retornará sucesso apenas quando a aplicação conseguir executar uma
consulta simples no PostgreSQL. O endpoint retornará falha HTTP quando a
dependência estiver indisponível.

### Configuração explícita do frontend e CORS

O frontend usará `NEXT_PUBLIC_API_URL`; o backend usará `CORS_ORIGIN` e `PORT`.
Valores locais seguros serão documentados nos arquivos de exemplo.

### Imagens Docker multi-stage

Backend e frontend terão Dockerfiles independentes com stages de dependências,
build e runtime. O Compose de desenvolvimento continuará responsável pelo banco,
mas poderá construir os serviços da aplicação.

### Dependabot e colaboração mínima

Dependabot acompanhará npm e GitHub Actions. `.editorconfig`,
`CONTRIBUTING.md`, template de pull request e `CODEOWNERS` não serão impostos sem
um time conhecido; será criado o conjunto que não exige proprietários nominais.

### Proteção HTTP e OpenAPI

O backend usará `helmet` para aplicar cabeçalhos HTTP seguros e publicará um
documento OpenAPI pequeno, mantido junto às rotas iniciais. A documentação será
controlada por `API_DOCS_ENABLED`, permanecendo explícita por ambiente e sem
introduzir uma dependência com vulnerabilidade transitiva conhecida.

### Correlação e logs de requisição

Um middleware aceitará ou gerará `X-Request-Id`, devolverá o identificador na
resposta e registrará método, caminho, status e duração. A solução usa o logger
do NestJS e não introduz uma plataforma externa de observabilidade.

### Hooks e cobertura

Husky e lint-staged executarão checks rápidos somente sobre arquivos staged.
Testes unitários usarão o test runner e a cobertura nativos do Node.js, com
limiares mínimos aplicados à lógica explicitamente incluída.

## Risks / Trade-offs

- [Testes mais lentos na CI] → Usar cache do npm e executar uma única suíte de
  integração sequencial.
- [Health check acoplado ao banco] → Manter a resposta simples e timeout curto.
- [Docker Compose diferente da produção] → Documentar que as imagens são
  artefatos reproduzíveis, não uma definição final de infraestrutura.
- [CORS configurado incorretamente] → Validar URL e manter origem local explícita
  no exemplo.
- [Hook local lento] → Restringir lint-staged aos arquivos alterados e manter a
  CI como autoridade final.
- [Documentação exposta indevidamente] → Controlar Swagger por variável de
  ambiente validada.

## Migration Plan

1. Adicionar scripts raiz e validação de ambiente.
2. Adicionar health check e atualizar testes.
3. Externalizar URL da API e CORS.
4. Adicionar Dockerfiles e healthchecks.
5. Adicionar CI, Dependabot e documentação.
6. Executar localmente o mesmo contrato da CI.
7. Adicionar proteção HTTP, OpenAPI, correlação, hooks e cobertura unitária.

Rollback: remover workflow/configurações e restaurar os valores locais
anteriores; não há migração de dados.

## Open Questions

- Qual provedor hospedará frontend, backend e PostgreSQL?
- Deploy de produção será baseado em imagens Docker ou integração nativa do
  provedor?
- Quais pessoas ou equipes deverão constar em `CODEOWNERS`?
