## Why

O projeto já possui grupos, seleções e agenda de jogos no seed, mas esses dados
ainda não são expostos em APIs de leitura nem apresentados no frontend. Criar uma
consulta autenticada da Copa valida o modelo atual com uma funcionalidade real,
mantém os dados dentro da experiência de usuário logado e estabelece componentes
reutilizáveis antes de avançar para bolões, participantes, palpites e ranking.

## What Changes

- Expor endpoints autenticados de leitura para grupos, seleções e jogos.
- Criar uma tela protegida no frontend para consultar dados da Copa.
- Apresentar grupos com suas seleções, bandeiras e códigos FIFA.
- Apresentar agenda de jogos com fase, data/hora, placar quando houver e times
  pendentes quando ainda não definidos.
- Apresentar fases eliminatórias em formato de chaves de confronto.
- Criar helpers/componentes reutilizáveis para bandeira, seleção, fase, data e
  cards/listas.
- Manter os dados como somente leitura nesta change; nenhuma regra de bolão,
  participante, palpite ou pontuação será implementada aqui.
- Incluir no mesmo PR o arquivamento/sincronização pendente da change
  `implementar-ui-autenticacao`, conforme decisão operacional atual.

## Capabilities

### New Capabilities

- `world-cup-data`: consulta autenticada de grupos, seleções e agenda de jogos
  da Copa.

### Modified Capabilities

- `project-foundation`: a fundação passa a incluir endpoints autenticados de
  leitura para dados base da Copa e telas protegidas no frontend que consomem
  esses dados.

## Impact

- Backend NestJS:
  - novos módulos/controllers/services protegidos por JWT para grupos, seleções
    e jogos;
  - consultas TypeORM sobre entidades existentes `Group`, `Team` e `Game`;
  - DTOs de resposta sem alterar banco ou migrations.
- Frontend Next.js:
  - nova área/feature para dados da Copa;
  - nova rota protegida, preferencialmente `/copa`;
  - componentes reutilizáveis de apresentação.
- Testes:
  - suíte de fundação deve validar endpoints protegidos e renderização básica da
    tela protegida;
  - testes unitários podem cobrir helpers de fase, data e bandeira quando forem
    extraídos.
- Documentação:
  - README deve listar a nova rota protegida e os endpoints autenticados;
  - OpenSpec deve arquivar a change anterior junto no PR desta change.
