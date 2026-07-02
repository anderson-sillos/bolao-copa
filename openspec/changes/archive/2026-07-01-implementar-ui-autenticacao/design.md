## Context

O frontend ainda é uma página inicial mínima em `pages/index.tsx`, enquanto o
backend já expõe cadastro, login, perfil autenticado e documentação OpenAPI. Esta
change conecta os dois lados e cria uma organização inicial para o código de
autenticação no frontend antes que novas telas do bolão sejam construídas sobre
esse fluxo.

## Goals / Non-Goals

**Goals:**

- Criar páginas de cadastro e login.
- Avaliar e decidir a abordagem de UI/styling antes de implementar as telas.
- Consumir os endpoints de autenticação existentes.
- Manter estado básico autenticado/deslogado.
- Permitir logout local.
- Criar uma organização inicial para cliente HTTP, armazenamento de sessão e
  funções/componentes de autenticação.
- Exibir mensagens de erro compreensíveis vindas da API.

**Non-Goals:**

- Implementar cookie HTTP-only, refresh token ou rotação/revogação de sessão.
- Implementar login social, MFA ou recuperação de senha.
- Implementar autorização por papéis/permissões.
- Alterar contratos do backend ou migrations.
- Criar design visual final do produto.

## Decisions

- **Sessão temporária em `localStorage`:** usar `localStorage` para persistir o
  access token nesta fase inicial. É simples, funciona bem para validar o fluxo
  ponta a ponta e mantém a implementação pequena. A migração para cookie
  HTTP-only + refresh token permanece registrada no roadmap. Esta decisão é
  aceita apenas para o estágio inicial; antes de produção, sessão via cookie
  seguro, renovação e revogação devem ser tratadas em change própria.
- **Cliente de API compartilhado:** criar um cliente/funções em área reutilizável
  do frontend para concentrar `NEXT_PUBLIC_API_URL`, headers e parsing de erros.
  Isso evita espalhar `fetch` cru por páginas.
- **Código de auth isolado:** criar uma área dedicada para autenticação no
  frontend, separando armazenamento de token, chamadas de API e uso pelas páginas.
- **Pages Router por enquanto:** manter o padrão atual do projeto com `pages/`,
  evitando migração prematura para App Router.
- **Tailwind CSS como base inicial de UI/styling:** usar Tailwind CSS nesta
  change para construir as telas de autenticação com produtividade, baixo
  acoplamento visual e liberdade para criar a identidade do Bolão. A decisão foi
  tomada após comparar CSS Modules/global CSS, Tailwind CSS, shadcn/ui, Material
  UI, Chakra UI, Bootstrap/React Bootstrap, Ant Design, Mantine, Radix UI e
  jQuery UI no estudo `ui-styling-study.md`. Não será adotada biblioteca de
  componentes nesta change; `shadcn/ui` fica como evolução candidata se a base
  Tailwind se mostrar adequada.
- **Sem dependência de estado global externa:** usar React state/effects e helpers
  locais enquanto o fluxo é pequeno. Bibliotecas de estado podem ser avaliadas
  quando o domínio do bolão crescer.

## Sequência de adoção do Tailwind CSS

O Tailwind CSS deve ser instalado e configurado antes da expansão das telas de
autenticação. A página de cadastro, criada primeiro para validar o fluxo
funcional, deve ser revisada logo após a configuração visual para ficar coerente
com a base de UI escolhida. Em seguida, as páginas de login e home autenticada
devem nascer já usando a mesma abordagem.

Para o Pages Router, a configuração inicial deve manter a integração mínima:

- dependências `tailwindcss`, `@tailwindcss/postcss` e `postcss` no workspace
  frontend;
- `postcss.config.mjs` no frontend usando o plugin `@tailwindcss/postcss`;
- CSS global importado em `pages/_app.tsx`;
- estilos utilitários aplicados diretamente nas telas iniciais, sem biblioteca
  de componentes nesta change.

## Organização de páginas, features e componentes

As rotas em `pages/` devem permanecer finas, delegando a maior parte da UI e da
lógica de formulário para componentes em `src/features/<feature>/` e
componentes compartilhados em `src/components/`. Isso mantém o padrão React/Next
com TSX, mas evita que arquivos de rota concentrem layout, estado, chamadas de
API e mensagens de erro conforme o fluxo crescer.

A divisão inicial adotada é:

- `pages/*.tsx`: entrada da rota, responsável apenas por renderizar/compor a
  tela;
- `src/features/<feature>/components/`: componentes específicos de uma área
  funcional, como `RegisterForm`, `LoginForm` e `AuthShell`;
- `src/components/ui/`: componentes genéricos de interface, sem regra de
  negócio, como `TextField` e `Alert`;
- `src/components/layout/`: layouts compartilhados de aplicação quando surgirem
  telas fora de autenticação com estrutura comum;
- `src/features/<feature>/hooks/`: hooks reutilizáveis de uma feature quando a
  lógica de tela crescer;
- `src/features/<feature>/services/`: integrações/clientes específicos de uma
  feature quando não forem utilitários globais;
- `src/features/<feature>/types.ts`: tipos compartilhados dentro da feature.

Componentes devem começar próximos da feature quando carregam semântica do
domínio. Quando ficarem genéricos e úteis para mais de uma feature, devem ser
promovidos para `src/components/ui/` ou `src/components/layout/`. O objetivo é
evitar tanto páginas grandes quanto uma pasta única de componentes sem contexto.

## Risks / Trade-offs

- **Token em `localStorage` é mais exposto a XSS** → mitigar mantendo isso como
  estratégia temporária documentada e planejando session cookie/cookie
  HTTP-only, refresh token, revogação e endurecimento de segurança em change
  futura.
- **Estado de sessão simples pode precisar evoluir** → mitigar isolando storage e
  cliente de API para facilitar troca posterior.
- **Mensagens da API podem ter formatos variados** → mitigar com parsing
  defensivo de erros (`message` string ou array).
- **Organização inicial pode ser refinada** → mitigar mantendo a estrutura enxuta
  e focada em autenticação, sem criar arquitetura pesada cedo demais.
- **Escolha prematura de UI pode gerar retrabalho** → mitigar fazendo uma
  discussão curta e registrada antes da implementação das telas.
- **Bibliotecas populares podem não encaixar no stack atual** → mitigar avaliando
  não apenas popularidade, mas também integração real com React/Next moderno,
  SSR/hidratação, dependências extras e impacto no bundle.
