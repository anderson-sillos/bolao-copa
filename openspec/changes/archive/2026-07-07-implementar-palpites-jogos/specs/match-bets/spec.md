## ADDED Requirements

### Requirement: Consulta autenticada de palpites

O sistema SHALL disponibilizar os palpites do usuário autenticado sem expor
palpites de outros usuários.

#### Scenario: Listagem dos meus palpites

- **WHEN** uma pessoa autenticada consultar seus palpites
- **THEN** o sistema SHALL retornar apenas os palpites associados ao usuário do
  token

#### Scenario: Consulta de palpite por jogo

- **WHEN** uma pessoa autenticada consultar o palpite de um jogo específico
- **THEN** o sistema SHALL retornar o palpite daquele usuário para o jogo ou
  indicar que ainda não há palpite salvo

#### Scenario: Consulta sem autenticação

- **WHEN** uma pessoa sem token válido tentar consultar palpites
- **THEN** o sistema SHALL rejeitar a requisição por falta de autenticação

### Requirement: Registro de palpite de placar

O sistema SHALL permitir que uma pessoa autenticada registre um palpite de
placar para um jogo elegível da Copa.

#### Scenario: Criação válida de palpite

- **WHEN** uma pessoa autenticada enviar placares inteiros não negativos para um
  jogo existente, não iniciado e com seleções definidas
- **THEN** o sistema SHALL persistir o palpite associado ao usuário autenticado e
  ao jogo informado

#### Scenario: Palpite duplicado para o mesmo jogo

- **WHEN** uma pessoa autenticada enviar um novo palpite para um jogo em que já
  possui palpite salvo
- **THEN** o sistema SHALL manter apenas um palpite por usuário e jogo,
  atualizando o placar salvo ou rejeitando a duplicidade de forma compreensível

#### Scenario: Placar inválido

- **WHEN** uma pessoa autenticada enviar placar ausente, decimal, negativo ou
  não numérico
- **THEN** o sistema SHALL rejeitar a requisição antes de persistir o palpite

#### Scenario: Jogo inexistente

- **WHEN** uma pessoa autenticada tentar palpitar em um jogo inexistente
- **THEN** o sistema SHALL rejeitar a requisição sem criar palpite

#### Scenario: Jogo sem seleções definidas

- **WHEN** uma pessoa autenticada tentar palpitar em um jogo sem `teamA` ou
  `teamB` definidos
- **THEN** o sistema SHALL rejeitar a requisição até que o confronto esteja
  definido

### Requirement: Edição de palpite antes do jogo

O sistema SHALL permitir alteração do palpite do usuário autenticado somente
antes do início do jogo.

#### Scenario: Atualização antes do início

- **WHEN** uma pessoa autenticada atualizar o placar de um palpite antes do
  horário de início do jogo
- **THEN** o sistema SHALL persistir o novo placar e atualizar a data de
  modificação do palpite

#### Scenario: Bloqueio após início do jogo

- **WHEN** uma pessoa autenticada tentar criar ou atualizar palpite para um jogo
  cujo horário de início já passou
- **THEN** o sistema SHALL rejeitar a alteração e preservar o palpite anterior,
  quando existir

#### Scenario: Usuário não altera palpite alheio

- **WHEN** uma pessoa autenticada atualizar um jogo para o qual outro usuário
  possui palpite
- **THEN** o sistema SHALL alterar somente o palpite do usuário autenticado ou
  criar um novo palpite próprio

### Requirement: Tela protegida de palpites

O frontend SHALL disponibilizar uma tela protegida para a pessoa autenticada
preencher e revisar seus palpites dos jogos da Copa.

#### Scenario: Acesso autenticado à tela de palpites

- **WHEN** uma pessoa autenticada acessar a tela de palpites
- **THEN** a interface SHALL carregar jogos e palpites do usuário, exibindo
  campos de placar para jogos elegíveis

#### Scenario: Acesso deslogado à tela de palpites

- **WHEN** uma pessoa sem sessão local acessar a tela de palpites
- **THEN** a interface SHALL orientar a pessoa a entrar ou criar conta antes de
  preencher palpites

#### Scenario: Token expirado na tela de palpites

- **WHEN** a API rejeitar o token durante o carregamento ou salvamento de
  palpites
- **THEN** a interface SHALL limpar a sessão local e apresentar estado deslogado

#### Scenario: Jogo bloqueado na interface

- **WHEN** um jogo já tiver iniciado ou ainda não possuir seleções definidas
- **THEN** a interface SHALL impedir edição do palpite daquele jogo e exibir um
  estado compreensível

#### Scenario: Feedback de salvamento

- **WHEN** a pessoa salvar um palpite pela tela
- **THEN** a interface SHALL apresentar estado de carregamento, sucesso ou erro
  para o jogo afetado sem quebrar os demais palpites da lista

#### Scenario: Navegação pela home

- **WHEN** uma pessoa autenticada estiver na página inicial
- **THEN** a interface SHALL oferecer caminho para preencher ou revisar palpites
