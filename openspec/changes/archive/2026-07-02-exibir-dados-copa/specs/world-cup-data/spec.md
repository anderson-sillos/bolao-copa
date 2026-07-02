## ADDED Requirements

### Requirement: Consulta autenticada de grupos

O sistema SHALL disponibilizar os grupos da Copa com suas seleções de forma
autenticada e somente leitura.

#### Scenario: Listagem de grupos

- **WHEN** uma pessoa autenticada consultar os grupos da Copa
- **THEN** o sistema SHALL retornar os grupos ordenados por nome com suas
  respectivas seleções

#### Scenario: Grupos sem autenticação

- **WHEN** uma pessoa sem token válido tentar consultar os grupos da Copa
- **THEN** o sistema SHALL rejeitar a requisição por falta de autenticação

#### Scenario: Seleções do grupo

- **WHEN** um grupo possuir seleções associadas
- **THEN** cada seleção SHALL incluir identificador, nome, código FIFA e
  `flag_icon_code`

### Requirement: Consulta autenticada de seleções

O sistema SHALL disponibilizar as seleções da Copa de forma autenticada e
somente leitura.

#### Scenario: Listagem de seleções

- **WHEN** uma pessoa autenticada consultar as seleções
- **THEN** o sistema SHALL retornar as seleções ordenadas por nome com
  identificador, nome, código FIFA, grupo quando existir e `flag_icon_code`

#### Scenario: Seleções sem autenticação

- **WHEN** uma pessoa sem token válido tentar consultar as seleções
- **THEN** o sistema SHALL rejeitar a requisição por falta de autenticação

#### Scenario: Bandeira da seleção

- **WHEN** uma seleção possuir `flag_icon_code`
- **THEN** a interface SHALL renderizar um ícone de bandeira visível e
  consistente entre navegadores sem exigir emoji real armazenado no banco

### Requirement: Consulta autenticada da agenda de jogos

O sistema SHALL disponibilizar a agenda de jogos da Copa de forma autenticada e
somente leitura.

#### Scenario: Listagem de jogos

- **WHEN** uma pessoa autenticada consultar a agenda de jogos
- **THEN** o sistema SHALL retornar jogos ordenados por data/hora com fase,
  data/hora, placar quando houver e seleções participantes

#### Scenario: Jogo da fase de grupos

- **WHEN** um jogo pertencer à fase de grupos
- **THEN** a resposta SHALL incluir o grupo do confronto para apresentação na
  agenda

#### Scenario: Jogo com placar conhecido

- **WHEN** um jogo possuir placar final conhecido no seed
- **THEN** a resposta SHALL incluir `scoreA` e `scoreB`

#### Scenario: Jogo decidido por pênaltis

- **WHEN** um jogo possuir decisão por pênaltis no seed
- **THEN** a resposta SHALL incluir `penaltyScoreA` e `penaltyScoreB`

#### Scenario: Jogos sem autenticação

- **WHEN** uma pessoa sem token válido tentar consultar a agenda de jogos
- **THEN** o sistema SHALL rejeitar a requisição por falta de autenticação

#### Scenario: Jogo com seleções definidas

- **WHEN** um jogo possuir `teamA` e `teamB`
- **THEN** a resposta SHALL incluir dados públicos das duas seleções

#### Scenario: Jogo com seleções pendentes

- **WHEN** um jogo ainda não possuir uma ou ambas as seleções definidas
- **THEN** a resposta SHALL representar a seleção ausente como `null` e a
  interface SHALL apresentar estado amigável de “A definir”

#### Scenario: Filtro por fase

- **WHEN** uma fase válida for informada na consulta de jogos
- **THEN** o sistema SHALL retornar apenas jogos daquela fase

### Requirement: Chaves das fases eliminatórias

O frontend SHALL apresentar os jogos das fases eliminatórias em formato de
chaves de confronto.

#### Scenario: Visualização das eliminatórias

- **WHEN** uma pessoa autenticada consultar os jogos das fases eliminatórias
- **THEN** a interface SHALL agrupar os confrontos por fase e apresentá-los em
  formato de chaves

#### Scenario: Confronto eliminatório com seleção pendente

- **WHEN** um confronto eliminatório ainda não possuir uma ou ambas as seleções
  definidas
- **THEN** a chave SHALL apresentar o participante pendente como “A definir”

#### Scenario: Ordenação dos confrontos na chave

- **WHEN** os confrontos eliminatórios forem exibidos
- **THEN** a interface SHALL ordenar confrontos de cada fase por `bracketOrder`
  recebido da API, usando data/hora e número do jogo apenas como critério de
  desempate

#### Scenario: Ordem visual fixa da chave

- **WHEN** um jogo pertencer a uma fase eliminatória
- **THEN** a resposta SHALL incluir `bracketOrder` para representar sua posição
  visual dentro daquela fase

#### Scenario: Origem do participante na chave

- **WHEN** um confronto eliminatório depender do vencedor ou perdedor de outro
  jogo
- **THEN** a interface SHALL exibir a origem do participante usando o número do
  jogo de referência

#### Scenario: Alinhamento visual do chaveamento

- **WHEN** os confrontos eliminatórios forem apresentados na visualização de
  chaves
- **THEN** a interface SHALL alinhar horizontalmente cada jogo das fases
  seguintes ao centro visual do grupo de jogos da fase anterior que alimenta o
  confronto

#### Scenario: Base visual dinâmica do chaveamento

- **WHEN** a pessoa rolar horizontalmente a visualização de chaves e outra fase
  se tornar dominante no início da área visível
- **THEN** a interface SHALL usar essa fase como nova base visual de alinhamento
- **AND** a interface SHALL preservar a visualização dos jogos, ajustando a
  posição vertical quando necessário

#### Scenario: Ordem da final na coluna decisiva

- **WHEN** final e disputa de terceiro lugar forem apresentadas na mesma coluna
- **THEN** a interface SHALL apresentar a Final antes da Disputa de terceiro
  lugar
- **AND** a Final SHALL possuir destaque visual adicional em relação aos demais
  jogos da chave

#### Scenario: Controle horizontal do chaveamento

- **WHEN** a visualização de chaves possuir conteúdo horizontal além da área
  visível
- **THEN** a interface SHALL oferecer controles no topo do quadro para rolar as
  chaves para esquerda e direita
- **AND** cada acionamento SHALL avançar ou recuar aproximadamente uma coluna de
  fase por vez

### Requirement: Tela protegida de dados da Copa

O frontend SHALL disponibilizar uma tela protegida para pessoas autenticadas
consultarem grupos, seleções e agenda de jogos.

#### Scenario: Acesso autenticado à tela da Copa

- **WHEN** uma pessoa autenticada acessar a rota da Copa
- **THEN** a interface SHALL apresentar seções para grupos, seleções, agenda da
  fase de grupos e chaves das fases eliminatórias

#### Scenario: Acesso deslogado à tela da Copa

- **WHEN** uma pessoa sem sessão local acessar a rota da Copa
- **THEN** a interface SHALL orientar a pessoa a entrar ou criar conta antes de
  consultar os dados

#### Scenario: Token expirado na tela da Copa

- **WHEN** a API rejeitar o token durante o carregamento dos dados da Copa
- **THEN** a interface SHALL limpar a sessão local e apresentar estado deslogado

#### Scenario: Falha ao carregar dados

- **WHEN** a API de dados da Copa estiver indisponível ou retornar erro
- **THEN** a interface SHALL exibir mensagem compreensível sem quebrar a página

#### Scenario: Navegação pela home

- **WHEN** uma pessoa autenticada estiver na página inicial
- **THEN** a interface SHALL oferecer caminho para consultar os dados da Copa
