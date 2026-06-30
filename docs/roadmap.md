# Roadmap

Este arquivo registra decisões adiadas e melhorias planejadas que não fazem
parte do escopo implementado atual. Itens daqui podem virar issues no GitHub
quando forem priorizados.

## Autenticação e segurança

- Refresh token e estratégia de rotação/revogação.
- Armazenamento de tokens em cookies HTTP-only quando a arquitetura do frontend
  estiver pronta para esse fluxo.
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
