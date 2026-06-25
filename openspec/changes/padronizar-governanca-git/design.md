## Context

O repositório GitHub público foi criado em
`https://github.com/anderson-sillos/bolao-copa`. A fundação já tem CI, Husky e
lint-staged, e esta mudança estabelece regras verificáveis para o histórico Git
e para a entrada de mudanças na `main`.

## Goals / Non-Goals

**Goals:**

- Manter `main` estável usando branches de curta duração.
- Tornar nomes de branches, commits e títulos de pull request previsíveis.
- Vincular mudanças relevantes aos artefatos OpenSpec.
- Automatizar verificações sem depender inicialmente de ações de terceiros.
- Preparar o repositório para proteção de branch e squash merge no GitHub.

**Non-Goals:**

- Criar branches permanentes `develop`, `release` ou `hotfix`.
- Automatizar publicação de releases ou changelog nesta etapa.
- Configurar regras do repositório remoto antes de ele existir.
- Exigir commits assinados sem que a identidade Git esteja definida.

## Decisions

### Trunk-based development

`main` será a única branch permanente. Mudanças usarão branches curtas nos
formatos `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `refactor/<slug>`,
`test/<slug>`, `chore/<slug>`, `ci/<slug>`, `perf/<slug>`, `build/<slug>` ou
`revert/<slug>`. Uma branch `dependabot/*` será aceita para a automação existente.

A alternativa Git Flow foi descartada porque acrescentaria branches e cerimônia
sem benefício para o tamanho e estágio atuais do projeto.

### Conventional Commits

Mensagens locais e títulos de pull request seguirão Conventional Commits.
Commitlint será executado por um hook `commit-msg`; o título do PR será validado
na CI. O escopo será opcional e os tipos aceitos serão explicitamente
configurados.

### Squash merge

Pull requests serão integrados por squash. Assim, o título validado do PR se
torna a mensagem principal na `main`, permitindo commits intermediários na
branch sem poluir o histórico permanente.

### Validação de metadados no workflow existente

Um job leve e sem banco validará branch de origem e título do PR. O job de
qualidade continuará independente e será executado em pushes e pull requests.
As regras de proteção remota deverão exigir ambos os jobs quando o GitHub for
configurado.

### Execução local e plano opcional para `act`

`npm run ci` continuará sendo o contrato local principal por executar a mesma
lógica de qualidade sem depender da emulação do runner. `npm ci` será reservado
à instalação reproduzível das dependências, como ocorre no GitHub Actions.

O `act` não será adotado agora. Seu ganho atual se limita à camada de
orquestração do workflow, enquanto os scripts npm já cobrem aplicação, banco e
qualidade. A ferramenta poderá ser adicionada opcionalmente quando surgirem
deploy, ambientes, secrets, artefatos ou relações mais complexas entre jobs. A
adoção futura deverá incluir `.actrc`, fixtures de eventos, comandos auxiliares
e limitações documentadas, sem torná-la pré-requisito para contribuição.

### Versionamento

Releases usarão SemVer e tags `vMAJOR.MINOR.PATCH`. Enquanto o produto estiver em
desenvolvimento inicial, versões `0.x` poderão introduzir mudanças incompatíveis
documentadas.

## Risks / Trade-offs

- [Regras locais podem ser ignoradas com `--no-verify`] → A CI valida o título
  que chegará à `main` via squash.
- [Branch aberta antes da adoção pode ter nome inválido] → Permitir `main` e
  automatizações conhecidas; renomear branches de trabalho quando necessário.
- [Proteção da `main` não existe localmente] → Documentar a configuração exata a
  aplicar após criar o repositório GitHub.
- [Squash perde commits intermediários] → Preservar contexto no PR e nos
  artefatos OpenSpec.
- [Simulação local divergir do GitHub] → Manter o runner real como autoridade e
  tratar o `act` apenas como diagnóstico opcional.

## Migration Plan

1. Documentar a política e atualizar o template de PR.
2. Instalar e configurar Commitlint.
3. Adicionar hook `commit-msg`.
4. Adicionar validação de metadados à CI.
5. Validar scripts e o workflow.
6. Após configurar o remote, habilitar proteção da `main` e squash merge.
7. Reavaliar o `act` quando a complexidade do workflow justificar sua manutenção.

Rollback: remover o job de metadados, o hook e as dependências do Commitlint; a
documentação pode ser revertida sem impacto na aplicação.

## Open Questions

- Pessoas ou equipes que deverão revisar mudanças quando houver colaboradores.
