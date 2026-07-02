## Context

O banco já possui dados iniciais da Copa: 12 grupos, 48 seleções e 104 jogos.
Esses dados hoje são validados por seed/testes, mas ainda não existem endpoints
autenticados nem telas protegidas para consulta. A última change criou a base de
UI com Tailwind CSS, autenticação no frontend e a política de páginas
enxutas/componentes por feature, que deve ser reutilizada aqui.

Também há uma pendência operacional: a change `implementar-ui-autenticacao` foi
mergeada, mas seu archive OpenSpec separado foi fechado sem merge. Nesta nova
change, o PR final deve incluir o arquivamento/sincronização dessa change
anterior junto com o archive da própria change, evitando PRs exclusivos de
archive.

## Baseline inicial

- Data do baseline: 2026-07-01.
- Branch da change: `feat/exibir-dados-copa`.
- Base da `main`: `78a0bf3 feat(frontend): implementar UI de autenticação`.
- Estado inicial: a branch foi criada a partir da `main`; as mudanças presentes
  no início da branch são os artefatos OpenSpec desta change e ajustes já
  discutidos para exemplos/placeholders genéricos.
- Versões confirmadas:
  - Node.js `v24.18.0`;
  - npm `11.16.0`;
  - Next.js `16.2.9`;
  - React `19.2.7`;
  - Tailwind CSS `4.3.2`;
  - NestJS core `11.1.27`;
  - TypeORM `1.0.0`;
  - TypeScript `6.0.3`.
- Validações rápidas executadas:
  - `openspec validate exibir-dados-copa --strict`;
  - `npm run format:check`.
- Validações completas recentes reaproveitáveis como referência: a change
  anterior executou build, lint, testes unitários, coverage, foundation,
  governance, audit e OpenSpec strict antes do merge do PR #21.

## Goals / Non-Goals

**Goals:**

- Expor dados de grupos, seleções e jogos por APIs autenticadas de leitura.
- Criar uma experiência protegida no frontend para usuários autenticados
  consultarem dados da Copa.
- Reaproveitar a organização por features e componentes compartilhados.
- Tratar jogos com seleções pendentes sem quebrar a UI.
- Mostrar fases e datas em formato amigável.
- Apresentar fases eliminatórias como chaves de confronto.
- Exigir autenticação para acessar endpoints e tela de dados da Copa.
- Substituir exemplos e placeholders com nomes próprios por textos genéricos ou
  explicativos na documentação, Swagger UI e telas.

**Non-Goals:**

- Criar, editar ou remover grupos, seleções e jogos.
- Implementar bolões, participantes, palpites, pontuação ou ranking.
- Resolver atualização dinâmica de classificados nas fases eliminatórias.
- Definir identidade visual final, design system completo ou layout definitivo
  do produto inteiro.

## Decisions

- **Capability autenticada `world-cup-data`:** agrupar consultas de grupos,
  seleções e jogos em uma capability própria porque esses dados serão base para
  palpites, bolões e ranking, mas não dependem dessas regras.
- **Endpoints protegidos por JWT:** criar endpoints de leitura que exigem
  autenticação bearer. Mesmo sendo dados base, eles fazem parte da experiência
  de usuário logado e não devem ficar disponíveis para acesso anônimo nesta fase.
- **Rotas backend em inglês:** usar rotas técnicas em inglês (`/groups`,
  `/teams`, `/games`) para manter consistência com tabelas/entidades existentes.
  A UI pode apresentar rótulos em português.
- **Rota frontend única `/copa` protegida:** iniciar com uma página que apresenta
  seções de grupos, seleções e agenda somente quando houver sessão local válida.
  Se não houver token, a interface deve orientar o usuário a entrar ou criar
  conta. Se o token expirar, deve limpar a sessão e voltar ao estado deslogado.
- **DTOs explícitos:** retornar DTOs de leitura em vez de entidades TypeORM
  diretamente. Isso evita vazar relações/campos acidentais e estabiliza o
  contrato da API.
- **Times pendentes como `null`:** jogos eliminatórios sem seleções definidas
  devem retornar `teamA`/`teamB` como `null`. O frontend deve exibir um texto
  amigável, como “A definir”.
- **Placares conhecidos no seed:** quando a fonte estática de referência trouxer
  `score.ft`, persistir o placar final em `score_a`/`score_b`. Quando a fonte
  ainda não trouxer placar, manter os campos como `null`.
- **Decisão por pênaltis no seed:** quando a fonte estática trouxer `score.p`,
  persistir o resultado da disputa por pênaltis em `penalty_score_a` e
  `penalty_score_b`, mantendo o placar final/tempo normal em `score_a` e
  `score_b`.
- **Fases como códigos + rótulo:** preservar o código existente (`fase_de_grupos`,
  `oitavas`, etc.) e adicionar mapeamento de rótulo no frontend ou DTO/helper
  compartilhado da feature. Isso evita migration desnecessária.
- **Eliminatórias em chave de confronto:** apresentar `segunda_fase`, `oitavas`,
  `quartas`, `semifinal`, `terceiro_lugar` e `final` em uma visualização de
  bracket/chaves. O seed deve manter `match_number` e origem de participante
  (`W89`, `L101`, etc.) quando a fonte indicar que a vaga vem de vencedor ou
  perdedor de outro jogo. O seed também deve manter `bracket_order` nos jogos
  eliminatórios para definir a ordem visual fixa de cada fase. A interface deve
  exibir essas origens para deixar claro o encadeamento dos confrontos sem
  calcular avanço automaticamente ou inferir a ordenação da chave. Como primeira
  etapa de layout, a segunda fase deve ser usada como base vertical inicial do
  bracket, alinhando cada jogo das fases seguintes no centro do grupo de jogos
  que alimenta aquele confronto. Durante o scroll horizontal, a primeira fase
  dominante na área visível deve passar a ser a base visual para reduzir espaços
  verticais quando fases anteriores deixarem de ser a referência principal.
- **Agenda compacta da fase de grupos:** exibir o grupo do confronto no destaque
  do card e usar código FIFA + bandeira para economizar espaço horizontal,
  mantendo o nome completo da seleção disponível no hover.
- **Bandeira a partir de `flag_icon_code`:** manter no seed/banco/API um código
  de ícone compatível com a biblioteca visual usada no frontend (`br`, `us`,
  `gb-eng`, `gb-sct`, etc.). O `country_code` continua sendo o código FIFA, e a
  UI não deve depender de emoji nativo porque Chrome/Windows pode exibir
  regional indicators em vez do ícone da bandeira.
- **Exemplos genéricos em documentação e UI:** usar nomes e e-mails genéricos,
  ou placeholders explicativos, para evitar associação dos exemplos a pessoas
  reais ou colaboradores do projeto.
- **Logs de bootstrap do backend:** registrar etapas principais da inicialização
  (`NestFactory`, configuração, Helmet, ValidationPipe, CORS, servidor HTTP e
  Swagger UI) para dar feedback durante `npm run start:dev --workspace=backend`
  sem ativar logs verbosos de queries TypeORM por padrão.
- **Wrapper de desenvolvimento do backend:** executar `nest start --watch` por
  meio de um script Node leve para imprimir feedback antes da Nest CLI começar a
  compilar e mensagens periódicas enquanto o watch ainda não entregou o
  bootstrap da aplicação.
- **Execução compilada sem watch:** manter um script explícito
  `start:compiled` para rodar `dist/main` após um build já executado, útil quando
  a intenção é apenas subir o backend sem recompilar ou observar arquivos.
- **Build limpo opcional do backend:** manter `build` incremental para o ciclo
  diário e adicionar `build:clean` para remover `dist` antes de compilar quando
  houver suspeita de artefatos antigos. O `clean` também deve remover
  `tsconfig.tsbuildinfo`, pois o cache incremental do TypeScript pode considerar
  a compilação atualizada mesmo quando `dist` foi apagada.
- **Swagger UI com autorização automática após login/cadastro:** usar
  `responseInterceptor` no Swagger UI local para capturar `accessToken` das
  respostas de `/auth/login` e `/auth/register` e preencher automaticamente o
  `bearerAuth`, evitando copiar/colar token durante testes manuais em `/docs`.

## Risks / Trade-offs

- **Endpoints podem crescer sem padrão de módulos** → criar módulos/services
  simples e focados em leitura para evitar lógica em controllers.
- **Duplicação de validação de sessão no frontend** → reutilizar helpers de
  auth/storage/API já existentes e manter a proteção da rota em componente de
  feature.
- **Página única `/copa` pode ficar grande** → dividir internamente em
  componentes de feature (`GroupCard`, `GameCard`, etc.) e promover componentes
  genéricos quando fizer sentido.
- **UI criada agora pode precisar se adaptar ao design final** → mitigar usando
  componentes pequenos, semânticos e reutilizáveis, preservando a política de
  organização frontend e evitando estilos acoplados demais a uma única tela.
- **Fases em string livre podem gerar rótulos inconsistentes** → centralizar o
  mapeamento de fases em helper testável.
- **Jogos eliminatórios pendentes podem confundir usuários** → apresentar
  explicitamente “A definir” e manter data/fase visíveis.
- **Bracket pode sugerir relações que o modelo ainda não tem** → deixar claro na
  UI que a visualização é agrupada por fase e evitar linhas/associações que
  impliquem avanço automático entre jogos.
- **Archive pendente da change anterior pode ser esquecido** → incluir task
  específica de sincronização/archive no fechamento desta change.
