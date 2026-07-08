## Context

O repositório já possui dois workflows: `Metadata`, exclusivo para pull
requests, e `Validate`, executado em pushes e pull requests. O `Validate`
instala dependências, sobe PostgreSQL e executa `npm run ci:runner`, que agrega
formatação, lint, build, governança, cobertura, integração e auditoria.

Esse desenho protege a `main`, mas apresenta um único check técnico. Quando há
falha, a revisão precisa abrir o log completo para descobrir qual etapa quebrou.
A próxima melhoria é transformar esse contrato em checks nomeados sem mudar os
comandos locais nem introduzir deploy sem ambiente definido.

## Goals / Non-Goals

**Goals:**

- Expor checks técnicos granulares no GitHub Actions.
- Isolar PostgreSQL no job de integração `Foundation`.
- Tornar cobertura e auditoria checks visíveis individualmente.
- Manter cache de npm em todos os jobs que instalam dependências.
- Atualizar testes de governança para proteger o desenho do workflow.
- Documentar os checks esperados para PRs e branch protection.

**Non-Goals:**

- Criar deploy, ambientes, secrets ou publicação de artefatos.
- Substituir `npm run ci` como contrato local principal.
- Introduzir matriz de versões do Node.js.
- Introduzir nova dependência para parse de YAML.

## Decisions

1. Separar o workflow `Validate` em jobs técnicos paralelos.

   O workflow continuará se chamando `Validate`, mas passará a conter jobs com
   nomes estáveis: `Format`, `Lint`, `Build`, `Governance`, `Coverage`,
   `Foundation` e `Audit`. Isso mantém um único arquivo técnico e melhora o
   diagnóstico no PR. A alternativa seria criar um workflow por tipo de check,
   mas isso espalharia configuração repetida e aumentaria o custo de manutenção.

2. Executar `npm ci` em cada job.

   Cada job será independente e usará `actions/setup-node` com cache de npm. A
   alternativa seria criar um job de instalação e compartilhar `node_modules`
   como artifact, mas isso costuma ser mais frágil, mais lento e menos fiel ao
   comportamento limpo da CI.

3. Manter PostgreSQL somente em `Foundation`.

   Apenas `npm run test:foundation:ci` precisa do service container. Os demais
   jobs ficam mais simples e não pagam o custo do banco. O contrato agregado
   `npm run ci:runner` continua disponível para execução local ou debug, mas o
   workflow passa a chamar os comandos específicos.

4. Proteger a granularização com teste de governança por leitura textual.

   O teste existente já valida workflows sem dependência extra. Vamos estender
   esse padrão para garantir nomes dos jobs e comandos críticos. A alternativa
   seria adicionar parser YAML, mas não há necessidade neste escopo.

## Risks / Trade-offs

- Mais jobs podem repetir instalação de dependências e consumir mais minutos de
  runner -> Mitigado pelo cache de npm e pela execução paralela, que melhora o
  tempo até o feedback.
- Branch protection pode precisar ser ajustada para exigir os novos checks ->
  Mitigado pela documentação explícita dos nomes esperados.
- Falhas em `npm ci` podem aparecer em múltiplos jobs -> Aceito, porque cada job
  independente deixa o check confiável e reexecutável isoladamente.
- `npm run ci:runner` deixa de ser chamado diretamente no workflow -> Mitigado
  por manter o script versionado e por chamar todos os comandos que compõem o
  contrato em jobs dedicados.
