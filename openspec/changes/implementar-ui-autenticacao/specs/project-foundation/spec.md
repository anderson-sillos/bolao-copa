## MODIFIED Requirements

### Requirement: Frontend Next.js executável

O sistema SHALL disponibilizar uma aplicação frontend Next.js com TypeScript,
uma página inicial renderizável, URL do backend configurável por ambiente e uma
organização inicial para código reutilizável de API e autenticação.

#### Scenario: Build do frontend

- **WHEN** o comando de build do workspace frontend for executado
- **THEN** a aplicação SHALL ser compilada com a versão TypeScript adotada sem
  erros

#### Scenario: Página inicial

- **WHEN** o servidor frontend estiver em execução e a rota raiz for acessada
- **THEN** uma página inicial SHALL ser renderizada

#### Scenario: URL externa da API

- **WHEN** `NEXT_PUBLIC_API_URL` estiver configurada
- **THEN** o frontend SHALL usar esse valor para acessar o backend

#### Scenario: Organização inicial do frontend

- **WHEN** o frontend consumir APIs autenticadas
- **THEN** chamadas HTTP, armazenamento de sessão e funções de autenticação SHALL
  ficar em arquivos reutilizáveis fora de `pages/index.tsx`

### Requirement: Política de organização de páginas e componentes

O frontend SHALL manter páginas de rota enxutas e delegar UI, estado e lógica de
caso de uso para componentes organizados por feature ou por uso compartilhado.

#### Scenario: Página de rota enxuta

- **WHEN** uma nova página for criada em `apps/frontend/pages`
- **THEN** o arquivo da rota SHALL atuar principalmente como ponto de composição
  e navegação, evitando concentrar layout extenso, estado de formulário,
  chamadas de API e tratamento de erro no mesmo arquivo

#### Scenario: Componentes organizados por feature

- **WHEN** uma página precisar de UI, estado ou lógica reutilizável de uma área
  funcional
- **THEN** esses elementos SHALL ficar em `apps/frontend/src/features/<feature>/`
  quando forem específicos da feature, ou em `apps/frontend/src/components/`
  quando forem componentes compartilhados sem regra de negócio

#### Scenario: Componentes compartilhados entre telas

- **WHEN** duas ou mais páginas usarem estrutura visual, campos, alertas ou
  padrões de interação equivalentes
- **THEN** o frontend SHALL extrair componentes compartilhados para
  `apps/frontend/src/components/ui/` ou `apps/frontend/src/components/layout/`
  antes de duplicar implementação entre as páginas

#### Scenario: Promoção de componente de feature para compartilhado

- **WHEN** um componente criado dentro de `apps/frontend/src/features/<feature>/`
  deixar de depender da semântica daquela feature
- **THEN** o componente SHALL ser promovido para `apps/frontend/src/components/`
  antes de ser reutilizado por outras features
