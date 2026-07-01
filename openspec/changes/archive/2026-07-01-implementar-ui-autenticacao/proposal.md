## Why

O backend já possui autenticação por JWT, mas o frontend ainda não permite que
usuários se cadastrem, façam login ou visualizem estado autenticado. A próxima
etapa natural é validar o fluxo ponta a ponta, mantendo uma estratégia simples
de sessão para o estágio inicial do projeto.

## What Changes

- Criar UI de cadastro e login no frontend.
- Pesquisar e discutir a abordagem de UI/styling antes de implementar os
  formulários.
- Integrar o frontend com `POST /auth/register`, `POST /auth/login` e
  `GET /auth/me`.
- Implementar estado básico autenticado/deslogado.
- Usar estratégia temporária de sessão no cliente com access token local, com
  logout removendo o token.
- Exibir mensagens de erro vindas da API de forma compreensível.
- Organizar a base inicial do frontend para clientes de API, armazenamento de
  sessão e componentes/funções de autenticação.
- Registrar que cookie HTTP-only, refresh token e logout com revogação ficam
  fora desta change e seguem no roadmap.

## Capabilities

### New Capabilities

- `frontend-authentication`: fluxos de cadastro, login, sessão temporária,
  logout local e perfil autenticado no frontend.

### Modified Capabilities

- `project-foundation`: estrutura inicial do frontend deve acomodar clientes de
  API e código de autenticação sem concentrar tudo em `pages/index.tsx`.

## Impact

- Frontend Next.js em `apps/frontend`.
- Potenciais dependências de UI/styling, a serem decididas antes da
  implementação.
- Contratos HTTP existentes do backend de autenticação.
- Testes de fundação e/ou testes de frontend conforme o menor caminho
  sustentável para validar o fluxo.
- README/documentação operacional de desenvolvimento.
- Sem mudanças previstas em banco, migrations ou backend de autenticação.
