## Context

O CI atual está concentrado em `.github/workflows/ci.yml`, acionado por `push`
em qualquer branch e por `pull_request`. Dentro dele há dois jobs:

- `Metadata`, condicionado por `if: github.event_name == 'pull_request'`;
- `Validate`, executado em todos os eventos do workflow.

Esse desenho faz sentido funcionalmente, mas gera ruído: todo push em branch
mostra um job `Metadata` como `Skipped`, mesmo quando o skip é esperado. Em PRs
também aparecem runs de `push` e `pull_request`, o que mistura checks úteis com
checks ignorados e torna menos óbvio quais validações pertencem ao gate de
merge.

O contrato atual de entrega já exige validação de branch, título e checks com
PostgreSQL em PRs. A melhoria deve preservar esse contrato, mas deixá-lo mais
legível e menos sujeito a regressão.

## Goals / Non-Goals

**Goals:**

- Separar validações de metadados de PR das validações técnicas.
- Evitar `Metadata` com status `Skipped` em runs de push.
- Manter checks obrigatórios claros para branch protection: `Metadata` e
  `Validate` no contexto de PR.
- Preservar a execução do contrato técnico com PostgreSQL para PRs.
- Cobrir a estrutura dos workflows em teste de governança, sem depender de rede
  ou de GitHub Actions real.
- Atualizar documentação para explicar quais checks aparecem em cada evento.

**Non-Goals:**

- Alterar regras de branch naming ou Conventional Commits.
- Trocar GitHub Actions por outra ferramenta.
- Introduzir `act` como requisito local.
- Alterar a composição do `npm run ci:runner`.
- Configurar branch protection via API nesta change.

## Decisions

### Separar workflows por responsabilidade

Serão criados workflows separados:

- `metadata.yml`: acionado apenas por `pull_request`, com job `Metadata`;
- `validate.yml`: acionado por `pull_request` e por pushes, com job `Validate`.

Alternativa considerada: manter um único arquivo e remover o `if` do job
`Metadata`. Isso não serve porque `github.head_ref` e título de PR não existem
em pushes comuns, e validar metadados nesses eventos exigiria lógica condicional
equivalente ao problema atual.

Alternativa considerada: manter um único arquivo e filtrar no nível de step.
Isso reduziria falhas falsas, mas continuaria exibindo jobs/steps ignorados e
não resolveria a leitura dos checks.

### Manter nomes de jobs estáveis

Os jobs devem continuar se chamando `Metadata` e `Validate`, porque esses são os
nomes já documentados como checks obrigatórios. A separação deve mudar a origem
do workflow, não o nome do check.

Alternativa considerada: renomear para `PR Metadata` e `CI Validate`. Isso
melhoraria legibilidade, mas exigiria atualização manual imediata de branch
protection e poderia quebrar o gate até a configuração externa ser ajustada.

### Estudar gatilhos de push sem ampliar escopo agora

Há duas opções razoáveis para o `Validate`:

```text
Opção A: push em qualquer branch + pull_request
Opção B: push em main + pull_request
```

A opção B reduz runs duplicados quando uma branch já tem PR aberto. A opção A
preserva feedback técnico antes de abrir PR. Para esta change, a recomendação é
manter o comportamento atual de validação técnica em pushes de qualquer branch,
e resolver apenas o ruído específico do `Metadata skipped`.

Se o custo de CI virar problema, uma change futura pode restringir `push` a
`main` e deixar branches de trabalho serem validadas principalmente por PR.

### Testar workflow como contrato de governança

O teste `test/governance.test.cjs` já valida branch naming e commitlint. Ele deve
passar a verificar também propriedades estruturais dos workflows:

- `metadata.yml` existe e é acionado por `pull_request`;
- `metadata.yml` não é acionado por `push`;
- `validate.yml` existe e é acionado por `pull_request` e `push`;
- job `Metadata` executa validação de branch e título de PR;
- job `Validate` executa `npm run ci:runner`;
- o workflow legado `ci.yml` é removido ou deixa de concentrar os dois jobs.

Para evitar nova dependência só para YAML, a primeira implementação pode usar
leitura de texto com checks focados em trechos estáveis. Se os workflows
crescerem, uma dependência/parsing YAML pode ser considerada em change futura.

### Atualizar documentação e roadmap

O roadmap já registra a melhoria. A implementação deve remover ou ajustar esse
item quando a melhoria for concluída e atualizar CONTRIBUTING/README se a lista
de checks esperados mudar visualmente.

## Risks / Trade-offs

- **Branch protection exigir checks por nome/contexto antigo** -> manter nomes
  de jobs `Metadata` e `Validate`; após merge, confirmar no GitHub se os checks
  obrigatórios continuam apontando para os contextos corretos.
- **Push em branch continuar duplicando `Validate` quando há PR aberto** ->
  aceito nesta change para preservar feedback antes do PR; registrar como
  melhoria futura se custo/ruído aumentar.
- **Teste textual de YAML ser frágil** -> manter asserts pequenos e ligados a
  comandos/trigger críticos; evitar testar formatação completa do YAML.
- **Separação de workflows divergir comandos de setup** -> duplicar apenas o
  mínimo necessário (`checkout`, `setup-node`, `npm ci`) e cobrir comandos
  principais nos testes de governança.

## Migration Plan

1. Criar `metadata.yml` e `validate.yml` a partir das responsabilidades atuais.
2. Remover ou substituir o workflow antigo `ci.yml`.
3. Atualizar testes de governança para refletir a nova estrutura.
4. Atualizar documentação/roadmap.
5. Validar localmente com `npm run test:governance`, lint/formatação e
   validação OpenSpec.
6. Após abrir PR, conferir no GitHub que `Metadata` e `Validate` passam no run
   de PR e que não há `Metadata skipped` no run de push.

Rollback: restaurar `.github/workflows/ci.yml` a partir do histórico e remover
os novos workflows/testes associados.

## Open Questions

- Após a separação, a branch protection no GitHub continuará reconhecendo os
  checks `Metadata` e `Validate` automaticamente ou exigirá atualização manual
  do contexto? A implementação deve confirmar isso no PR.
