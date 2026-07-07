## Why

O workflow atual executa `push` e `pull_request` no mesmo arquivo, mas o job
`Metadata` só roda em PR. Isso faz runs de push exibirem `Metadata` como
`Skipped`, gerando ruído na leitura dos checks e ambiguidade sobre quais
validações devem ser exigidas antes do merge.

## What Changes

- Separar a validação de metadados de PR em workflow próprio acionado apenas por
  `pull_request`.
- Manter a validação técnica em workflow próprio, com gatilhos explícitos para
  `pull_request` e pushes relevantes.
- Revisar o contrato de checks esperados para que branch protection e PRs
  exibam apenas checks úteis e compreensíveis.
- Adicionar cobertura de governança para a estrutura dos workflows, reduzindo o
  risco de regressão para jobs duplicados, `Skipped` desnecessário ou comandos
  divergentes do contrato documentado.
- Atualizar documentação/roadmap para refletir o fluxo de CI esperado após a
  melhoria.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `delivery-foundation`: refinar o contrato de integração contínua para
  distinguir validações de PR e validações técnicas, documentando checks
  esperados por evento.

## Impact

- Workflows em `.github/workflows/`.
- Testes de governança em `test/governance.test.cjs`.
- Documentação de contribuição e roadmap quando necessário.
- Configuração de branch protection pode precisar ser revisada no GitHub para
  exigir os checks corretos após a separação.
