## 1. Baseline e pesquisa

- [x] 1.1 Criar branch da change a partir da `main` limpa e registrar baseline de `npm ci`, lint, build, testes, foundation e auditoria.
- [x] 1.2 Revisar guia oficial TypeORM 0.3 → 1.0, release notes e breaking changes relevantes ao backend.
- [x] 1.3 Registrar versões atuais e compatibilidade declarada de `typeorm`, `@nestjs/typeorm`, CLI TypeORM e dependências relacionadas.

## 2. Tentativa controlada de atualização

- [x] 2.1 Atualizar TypeORM para 1.0 e dependências auxiliares necessárias sem `--force` ou `--legacy-peer-deps`.
- [x] 2.2 Validar `npm ci` limpo e decidir se a migração prossegue ou se há bloqueio comprovado.
- [x] 2.3 Confirmar ausência de bloqueio; se houvesse, documentar evidência, reverter alterações incompatíveis e preparar fechamento da issue com plano de retomada.

## 3. Compatibilidade de código e scripts

- [x] 3.1 Ajustar `data-source.ts`, imports e configuração TypeORM conforme APIs compatíveis com a versão adotada.
- [x] 3.2 Validar `app.module.ts`, entidades, decorators, metadata e constraints com build estrito.
- [x] 3.3 Validar ou ajustar scripts `typeorm`, `migration:generate`, `migration:run`, `migration:revert` e `seed`.

## 4. Validação de banco e schema

- [x] 4.1 Executar migration inicial em banco isolado e confirmar criação das tabelas esperadas.
- [x] 4.2 Executar rollback e confirmar remoção das tabelas criadas.
- [x] 4.3 Executar seed e validar grupos, seleções, jogos e unicidade de palpites.
- [x] 4.4 Verificar se há drift de schema ou SQL inesperado; documentar qualquer diferença aceita.

## 5. Documentação, CI e fechamento

- [x] 5.1 Atualizar README/CONTRIBUTING se houver mudança operacional para migrations, seed ou dependências.
- [x] 5.2 Executar `npm run ci`, Docker build de backend/frontend, OpenSpec validate e auditoria zerada.
- [x] 5.3 Atualizar a issue #9 com resultado, evidências e decisão final.
- [x] 5.4 Preparar PR com resumo da migração ou do bloqueio documentado.
