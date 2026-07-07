## 1. Baseline e preparação

- [x] 1.1 Revisar proposal, design e specs da change `melhorar-workflows-ci`.
- [x] 1.2 Criar branch `ci/melhorar-workflows-ci` a partir da `main` atualizada.
- [x] 1.3 Registrar estado limpo do Git e validações rápidas aplicáveis.

## 2. Workflows de CI

- [x] 2.1 Criar workflow `metadata.yml` acionado apenas por `pull_request`.
- [x] 2.2 Mover validação de branch e título de PR para o job `Metadata`.
- [x] 2.3 Criar workflow `validate.yml` para o job `Validate` com o contrato técnico atual.
- [x] 2.4 Remover ou substituir o workflow legado `ci.yml` sem alterar os comandos do contrato técnico.
- [x] 2.5 Preservar nomes de jobs `Metadata` e `Validate` para compatibilidade com branch protection.

## 3. Testes de governança

- [x] 3.1 Atualizar `test/governance.test.cjs` para validar existência e eventos dos workflows.
- [x] 3.2 Cobrir que `metadata.yml` não declara evento `push`.
- [x] 3.3 Cobrir que `validate.yml` executa `npm run ci:runner`.
- [x] 3.4 Cobrir que `metadata.yml` executa validação de branch e Commitlint do título do PR.

## 4. Documentação

- [x] 4.1 Atualizar CONTRIBUTING/README se a descrição dos checks esperados mudar.
- [x] 4.2 Remover ou ajustar o item correspondente em `docs/roadmap.md`.
- [x] 4.3 Registrar no design ou documentação a decisão sobre manter `Validate` em pushes de branches.

## 5. Validação e fechamento

- [x] 5.1 Executar `npm run format:check`.
- [x] 5.2 Executar `npm run lint`.
- [x] 5.3 Executar `npm run test:governance`.
- [x] 5.4 Executar validações adicionais aplicáveis ao escopo, incluindo OpenSpec strict.
- [x] 5.5 Abrir PR e confirmar que checks de PR exibem `Metadata` e `Validate` sem `Metadata skipped` no run de PR.
- [x] 5.6 Sincronizar specs e arquivar a change após implementação validada.
