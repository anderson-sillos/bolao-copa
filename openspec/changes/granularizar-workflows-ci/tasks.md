## 1. Baseline e branch

- [x] 1.1 Validar estado limpo da `main` local e alinhamento com `origin/main`.
- [x] 1.2 Criar branch `ci/granularizar-workflows-ci`.
- [x] 1.3 Executar validação OpenSpec strict da change antes da implementação.

## 2. Workflow técnico granular

- [x] 2.1 Atualizar `.github/workflows/validate.yml` para expor jobs `Format`, `Lint`, `Build`, `Governance`, `Coverage`, `Foundation` e `Audit`.
- [x] 2.2 Configurar checkout, Node.js via `.node-version`, cache de npm e `npm ci` em cada job técnico.
- [x] 2.3 Executar os comandos específicos em cada job: `format:check`, `lint`, `build`, `test:governance`, `test:coverage`, `test:foundation:ci` e `audit`.
- [x] 2.4 Manter PostgreSQL service container apenas no job `Foundation`.
- [x] 2.5 Preservar o workflow `Metadata` exclusivo de pull request.

## 3. Governança e documentação

- [x] 3.1 Atualizar `test/governance.test.cjs` para validar nomes dos jobs técnicos granulares.
- [x] 3.2 Validar por teste que apenas `Foundation` declara PostgreSQL.
- [x] 3.3 Validar por teste que cobertura e auditoria usam os comandos esperados.
- [x] 3.4 Atualizar `CONTRIBUTING.md` com os checks esperados e o impacto em branch protection.

## 4. Specs

- [x] 4.1 Sincronizar o delta de `delivery-foundation` na spec principal.
- [x] 4.2 Garantir que a change continua válida com `openspec validate granularizar-workflows-ci --strict`.

## 5. Validação local

- [x] 5.1 Executar `npm run format:check`.
- [x] 5.2 Executar `npm run lint`.
- [x] 5.3 Executar `npm run test:governance`.
- [x] 5.4 Executar `npm run test:coverage`.
- [x] 5.5 Executar `openspec validate --all --strict`.

## 6. PR e fechamento

- [ ] 6.1 Commitar e enviar a branch para o remoto.
- [ ] 6.2 Abrir PR e confirmar checks granulares no GitHub Actions.
- [ ] 6.3 Arquivar a change após validação dos checks reais.
- [ ] 6.4 Fazer merge do PR por squash.
- [ ] 6.5 Voltar para `main`, atualizar `main` e remover a branch de trabalho local.
