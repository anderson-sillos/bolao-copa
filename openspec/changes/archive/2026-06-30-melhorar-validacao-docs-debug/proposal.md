## Why

A API já usa `class-validator`, Helmet e Swagger UI, mas há ajustes de qualidade
necessários: mensagens padrão em inglês confundem consumidores brasileiros, a
página `/docs` viola a CSP por usar script inline, e a configuração de debug do
VS Code precisa iniciar pelo WSL para refletir o ambiente real do projeto.

## What Changes

- Padronizar mensagens de validação da autenticação em português, mantendo
  `class-validator`.
- Evoluir a estratégia para centralizar mensagens/decorators de validação e
  evitar strings genéricas ou espalhadas pelos DTOs, usando
  `apps/backend/src/common/validation/` como ponto compartilhado.
- Corrigir a Swagger UI para não depender de script inline bloqueado por CSP.
- Adicionar configuração versionada de debug do VS Code para backend, frontend e
  full stack executando os processos via WSL.
- Atualizar testes para cobrir a inicialização da Swagger UI sem script inline.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `user-authentication`: mensagens de validação de DTOs de autenticação devem ser
  claras, em português e preparadas para padronização central.
- `delivery-foundation`: documentação Swagger UI deve respeitar CSP; setup de
  desenvolvimento deve oferecer debug reproduzível via WSL.

## Impact

- Backend NestJS: DTOs de autenticação, utilitários compartilhados de validação e
  controlador de documentação.
- Testes de fundação: validação de `/docs` e assets locais da Swagger UI.
- Configuração de workspace: `.vscode/launch.json`, `.vscode/tasks.json` e
  `.gitignore`.
- Sem alterações de banco, migrations ou dependências novas.
