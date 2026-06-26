## 1. Baseline e dependências

- [x] 1.1 Criar branch da change e registrar baseline de instalação, lint, build e testes.
- [x] 1.2 Atualizar coordenadamente ESLint, TypeScript ESLint e integrações com Prettier.
- [x] 1.3 Atualizar TypeScript para 6 sem usar `--force` ou `--legacy-peer-deps`, ou documentar bloqueio comprovado.

## 2. ESLint flat config

- [x] 2.1 Criar flat config raiz para TypeScript, JavaScript, CommonJS e ignores do monorepo.
- [x] 2.2 Remover `.eslintrc.json` e ajustar scripts de lint dos workspaces.
- [x] 2.3 Ajustar lint-staged e testes de governança para usar a configuração nova.

## 3. TypeScript e workspaces

- [x] 3.1 Ajustar `tsconfig` do backend para TypeScript 6, decorators, JSON e resolução Node.
- [x] 3.2 Ajustar `tsconfig` do frontend conforme os requisitos do Next.js.
- [x] 3.3 Validar NestJS, Next.js, ts-node e TypeORM CLI com a versão adotada.

## 4. Ambiente e dotenv

- [x] 4.1 Mapear todos os consumidores de `dotenv` e o comportamento esperado da CLI.
- [x] 4.2 Remover dotenv usando carregamento nativo portátil ou atualizar para 17 com justificativa.
- [x] 4.3 Testar precedência entre `.env` local e variáveis fornecidas pela CI.

## 5. Validação e documentação

- [x] 5.1 Regenerar e validar `package-lock.json` com `npm ci` limpo e auditoria zerada.
- [x] 5.2 Executar lint, builds, migrations, rollback, seed, testes e imagens Docker.
- [x] 5.3 Atualizar README e CONTRIBUTING com requisitos e decisões da toolchain.
- [x] 5.4 Atualizar as issues #14, #15 e #16 com o resultado da implementação.
