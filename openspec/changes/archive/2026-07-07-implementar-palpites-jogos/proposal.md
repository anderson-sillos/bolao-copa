## Why

O projeto já permite cadastro, login e consulta autenticada dos jogos da Copa,
mas a pessoa participante ainda não consegue registrar seus palpites. Criar o
fluxo de palpites transforma a fundação atual em uma primeira experiência
jogável do bolão, preparando o caminho para pontuação e ranking.

## What Changes

- Expor endpoints autenticados para listar, criar e atualizar os palpites do
  usuário logado.
- Permitir um único palpite por usuário e jogo, reaproveitando a restrição já
  existente no modelo `bets`.
- Validar placares de palpite como números inteiros não negativos.
- Impedir criação ou atualização de palpite para jogo já iniciado.
- Criar uma tela protegida no frontend para preencher e revisar palpites dos
  jogos da Copa.
- Exibir estado de palpite salvo, pendente, erro de validação e acesso
  deslogado sem quebrar a experiência.
- Manter pontuação, ranking, bolões múltiplos e regras avançadas fora do escopo
  desta change.

## Capabilities

### New Capabilities

- `match-bets`: criação, consulta e atualização autenticada dos palpites de
  placar feitos pelo usuário logado para jogos da Copa.

### Modified Capabilities

- `project-foundation`: a fundação passa a incluir o primeiro fluxo jogável do
  bolão, com uso efetivo da entidade `bets` no backend e tela protegida no
  frontend.

## Impact

- Backend NestJS:
  - novo módulo/controller/service para palpites autenticados;
  - DTOs de entrada e resposta para palpites;
  - consultas TypeORM envolvendo `Bet`, `Game` e usuário autenticado;
  - documentação OpenAPI para os endpoints protegidos.
- Frontend Next.js:
  - nova rota protegida para palpites;
  - nova feature em `apps/frontend/src/features/`;
  - cliente de API, componentes de formulário compacto e estados de salvamento.
- Testes:
  - cobertura de API para autenticação, validação, upsert e bloqueio por início
    do jogo;
  - cobertura básica de renderização da tela protegida de palpites;
  - testes unitários para helpers de estado/formatação quando extraídos.
- Documentação:
  - README deve registrar os endpoints de palpites e a nova tela protegida;
  - OpenSpec deve ser sincronizado e arquivado ao final da implementação.
