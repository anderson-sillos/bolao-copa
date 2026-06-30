## 1. Validação de autenticação

- [x] 1.1 Criar `apps/backend/src/common/validation/` com mensagens e decorators centralizados para validação em português.
- [x] 1.2 Atualizar DTOs de cadastro e login para usar a padronização central.
- [x] 1.3 Adicionar ou ajustar testes para e-mail inválido em cadastro e login.

## 2. Documentação da API e CSP

- [x] 2.1 Remover inicialização inline da Swagger UI em `/docs`.
- [x] 2.2 Servir inicializador local em `/docs/swagger-ui-init.js`.
- [x] 2.3 Atualizar testes da fundação para validar que `/docs` não depende de script inline e carrega assets locais.

## 3. Debug local via WSL

- [x] 3.1 Versionar `.vscode/launch.json` com configurações de attach para backend, frontend e full stack.
- [x] 3.2 Versionar `.vscode/tasks.json` iniciando backend e frontend via `wsl.exe`.
- [x] 3.3 Ajustar `.gitignore` para permitir somente configurações compartilháveis do VS Code.

## 4. Validação e fechamento

- [x] 4.1 Registrar no roadmap técnico reorganizações arquiteturais futuras fora do escopo desta change.
- [x] 4.2 Executar formatação, lint e build relevantes.
- [x] 4.3 Executar testes unitários/cobertura e suíte de fundação quando o Docker estiver disponível.
- [x] 4.4 Validar OpenSpec da change em modo strict.
- [x] 4.5 Preparar commit/PR com resumo das melhorias.
