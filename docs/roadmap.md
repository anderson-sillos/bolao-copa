# Roadmap

Este arquivo registra decisões adiadas e melhorias planejadas que não fazem
parte do escopo implementado atual. Itens daqui podem virar issues no GitHub
quando forem priorizados.

## Autenticação e segurança

- Session cookie/cookie HTTP-only para substituir a estratégia temporária de
  token em `localStorage` antes de produção.
- Refresh token e estratégia de rotação/revogação.
- Logout com revogação/invalidação server-side quando houver sessões renováveis.
- Proteção CSRF compatível com a futura estratégia baseada em cookies.
- Revisão de atributos de cookies seguros (`HttpOnly`, `Secure`, `SameSite`,
  escopo e tempo de expiração).
- Login social via OAuth.
- MFA para contas que exigirem segurança adicional.
- Bloqueio ou atraso progressivo após tentativas repetidas de login com senha
  incorreta.
- Rate limiting para endpoints sensíveis.
- Auditoria de tentativas de autenticação.
- Rejeição de senhas comuns, vazadas ou presentes em listas conhecidas.

## Arquitetura e organização técnica

- Criar `DocsModule` e separar responsabilidades hoje concentradas em
  `docs.controller.ts`, por exemplo documento OpenAPI, assets da Swagger UI e
  controller HTTP.
- Criar `HealthModule` para manter simetria com os demais módulos NestJS conforme
  a aplicação crescer.
- Avaliar migração gradual de `entities/` centralizado para entidades próximas
  aos módulos de domínio quando surgirem novos domínios e relacionamentos mais
  complexos.
- Extrair helpers da suíte `test/foundation.integration.test.cjs` quando novos
  fluxos HTTP, banco e autenticação aumentarem o tamanho do arquivo.
- Avaliar padronização futura do formato global de erros de validação por campo,
  preservando as mensagens em português.

## CI/CD e governança

- Separar a validação de metadados de PR em um workflow próprio acionado apenas
  por `pull_request`, mantendo a validação técnica em workflow de
  `push`/`pull_request`, para evitar checks `Metadata` com status `Skipped` em
  execuções de push.
