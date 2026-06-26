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
