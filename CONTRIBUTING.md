# Contribuindo

Repositório oficial:
https://github.com/anderson-sillos/bolao-copa

## Preparação

1. Use Node.js 24.18.0 e npm 11 ou superior.
2. Execute `npm install`.
3. Copie os arquivos `.env.example` necessários.
4. Inicie o PostgreSQL com `docker compose up -d postgres`.
5. Execute migração e seed conforme o README.

## Estratégia de branches

O projeto usa trunk-based development:

- `main` é a única branch permanente e deve permanecer estável;
- toda mudança parte da `main` atualizada;
- branches de trabalho devem ser curtas e removidas após o merge;
- não usamos branches permanentes `develop`, `release` ou `hotfix`.

Use `<tipo>/<slug-em-kebab-case>`:

| Prefixo     | Uso                               |
| ----------- | --------------------------------- |
| `feat/`     | Nova funcionalidade               |
| `fix/`      | Correção de defeito               |
| `docs/`     | Documentação                      |
| `refactor/` | Refatoração sem mudança funcional |
| `test/`     | Testes                            |
| `chore/`    | Manutenção                        |
| `ci/`       | Integração contínua               |
| `build/`    | Build e dependências              |
| `perf/`     | Desempenho                        |
| `style/`    | Formatação sem mudança funcional  |
| `revert/`   | Reversão                          |

Exemplos:

```text
feat/autenticacao-jwt
fix/validacao-email
docs/estrategia-branches
```

Branches automáticas `dependabot/*` e `renovate/*` também são aceitas.

Valide um nome localmente:

```bash
npm run validate:branch -- feat/autenticacao-jwt
```

## Fluxo OpenSpec

Mudanças funcionais, arquiteturais ou que alterem contratos devem seguir:

```text
change OpenSpec → branch → implementação → verificação → pull request → squash
```

Use preferencialmente o mesmo assunto na change e na branch. Inclua no pull
request o caminho ou nome da change correspondente. Correções triviais de texto
ou manutenção sem alteração de comportamento podem dispensar uma nova change.

## Commits

Mensagens seguem Conventional Commits:

```text
<tipo>(<escopo opcional>): <descrição>
```

Tipos permitidos: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`,
`refactor`, `revert`, `style` e `test`.

Exemplos:

```text
feat(auth): adiciona autenticação JWT
fix(api): corrige validação do e-mail
docs: documenta estratégia de branches
```

A descrição deve ser objetiva, no presente, sem ponto final e com até 100
caracteres no cabeçalho. O escopo, quando usado, deve estar em kebab-case.

O hook `commit-msg` executa Commitlint. Também é possível validar manualmente:

```bash
echo "feat(auth): adiciona login" | npm run commitlint
```

Mantenha commits focados e não versione secrets ou arquivos `.env`. O uso de
`--no-verify` deve ser excepcional; a CI continua sendo a autoridade final.

## Validação obrigatória

Antes de abrir um pull request, execute:

```bash
npm run ci
```

O comando verifica formatação, lint, builds, governança Git, cobertura,
integração e dependências.

`npm ci` e `npm run ci` possuem funções diferentes:

- `npm ci` instala exatamente as versões registradas no lockfile e é usado pelo
  GitHub Actions;
- `npm run ci` executa localmente o contrato completo de qualidade.

O hook de pre-commit executa checks rápidos somente nos arquivos staged. Para
validar manualmente a cobertura unitária:

```bash
npm run test:coverage
```

### Plano futuro: execução com `act`

O [`act`](https://github.com/nektos/act) não é requisito para contribuir e não
substitui `npm run ci`. Sua adoção está planejada como ferramenta opcional
quando a esteira passar a incluir deploy, ambientes, secrets, artefatos ou jobs
com dependências mais complexas.

Quando isso ocorrer, a implementação deverá:

1. adicionar `.actrc` com uma imagem de runner compatível;
2. criar fixtures seguras para eventos `push` e `pull_request`;
3. fornecer comandos auxiliares para os jobs `Metadata` e `Validate`;
4. validar o PostgreSQL service container no WSL/Docker;
5. documentar diferenças conhecidas entre `act` e os runners reais do GitHub;
6. manter `npm run ci` como caminho local principal e obrigatório.

O objetivo será testar a orquestração específica do GitHub Actions antes do
push, sem transformar o download das imagens do `act` em custo obrigatório para
todo colaborador.

## Pull requests

- O título deve seguir Conventional Commits e será a mensagem do squash.
- Explique motivação, solução, riscos e impactos operacionais.
- Referencie a change OpenSpec quando aplicável.
- Informe novas variáveis de ambiente, migrações ou mudanças de API.
- Não misture refatorações não relacionadas.
- Mantenha o PR pequeno o bastante para revisão objetiva.
- Resolva comentários e aguarde todos os checks obrigatórios.
- Faça merge exclusivamente por squash e remova a branch.

## Revisão e merge

Enquanto houver apenas um mantenedor, revisão externa não é obrigatória, mas
todos os checks são. Ao adicionar colaboradores, configure pelo menos uma
aprovação e descarte aprovações quando novos commits forem enviados.

Após criar o repositório GitHub, proteja a `main` com:

- pull request obrigatório;
- merge commit e rebase merge desabilitados; squash merge habilitado;
- branches atualizadas antes do merge;
- conversas resolvidas;
- checks obrigatórios `Metadata` e `Validate`;
- bloqueio de force push e exclusão da branch;
- inclusão de administradores nas regras, quando suportado pelo plano.

## Versionamento e releases

Releases seguem Semantic Versioning e usam tags `vMAJOR.MINOR.PATCH`:

- `MAJOR`: mudança incompatível;
- `MINOR`: funcionalidade compatível;
- `PATCH`: correção compatível.

Durante a fase inicial, versões `0.x` podem evoluir rapidamente, mas mudanças
incompatíveis devem ser destacadas no pull request e nas notas da release.
