## 1. Revisão e baseline

- [x] 1.1 Revisar proposal, design e specs da change `implementar-palpites-jogos`.
- [x] 1.2 Criar branch da change a partir da `main` atualizada.
- [x] 1.3 Registrar baseline leve de ambiente, estado limpo do Git e validações rápidas aplicáveis.

## 2. Backend: API de palpites

- [x] 2.1 Criar módulo, service e controller para palpites autenticados.
- [x] 2.2 Criar DTOs de entrada para placares inteiros não negativos.
- [x] 2.3 Criar DTOs/mappers de resposta sem expor entidades TypeORM diretamente.
- [x] 2.4 Implementar listagem dos palpites do usuário autenticado.
- [x] 2.5 Implementar consulta de palpite do usuário autenticado por jogo.
- [x] 2.6 Implementar criação ou atualização de palpite para jogo elegível.
- [x] 2.7 Bloquear criação e atualização quando o jogo já tiver iniciado.
- [x] 2.8 Bloquear palpites para jogos inexistentes ou sem seleções definidas.
- [x] 2.9 Garantir que um usuário não consulte nem altere palpites de outro usuário.
- [x] 2.10 Documentar endpoints e esquema bearer na OpenAPI.

## 3. Frontend: cliente e helpers

- [x] 3.1 Criar feature `match-bets` em `apps/frontend/src/features/`.
- [x] 3.2 Criar cliente de API para listar, consultar e salvar palpites usando token explícito.
- [x] 3.3 Criar tipos de frontend alinhados aos DTOs públicos da API.
- [x] 3.4 Criar helpers para determinar jogos editáveis, bloqueados e pendentes.
- [x] 3.5 Reutilizar helpers/componentes existentes de jogos, bandeiras, fases e datas quando fizer sentido.

## 4. Frontend: tela protegida de palpites

- [x] 4.1 Criar rota fina `/palpites` em `apps/frontend/pages/`.
- [x] 4.2 Criar tela protegida que carrega jogos e palpites do usuário autenticado.
- [x] 4.3 Criar componentes de formulário compacto para placar por jogo.
- [x] 4.4 Exibir estados de carregamento, deslogado, erro, salvo e salvando por jogo.
- [x] 4.5 Bloquear edição na UI para jogos iniciados ou sem seleções definidas.
- [x] 4.6 Adicionar navegação da home para a tela de palpites no estado autenticado.

## 5. Testes

- [x] 5.1 Atualizar suíte de fundação para validar endpoints autenticados de palpites.
- [x] 5.2 Cobrir criação, atualização, validação de placar, jogo inexistente e acesso sem token.
- [x] 5.3 Cobrir bloqueio de palpite após início do jogo e para jogo sem seleções definidas.
- [x] 5.4 Cobrir isolamento entre usuários.
- [x] 5.5 Atualizar cobertura básica de renderização da rota `/palpites`.
- [x] 5.6 Adicionar testes unitários para helpers de frontend quando extraídos.

## 6. Documentação

- [x] 6.1 Atualizar README com endpoints autenticados de palpites e rota `/palpites`.
- [x] 6.2 Atualizar documentação frontend se a feature estabelecer novos padrões reutilizáveis.
- [x] 6.3 Registrar decisões sobre prazo de edição, jogos pendentes e escopo sem pontuação/ranking.

## 7. Fechamento

- [x] 7.1 Executar formatação, lint, build, testes, auditoria e OpenSpec strict aplicáveis.
- [x] 7.2 Sincronizar specs da change antes do fechamento.
- [x] 7.3 Arquivar a change `implementar-palpites-jogos` no mesmo PR da implementação.
- [x] 7.4 Preparar commit/PR com resumo da implementação, decisões e validações.
