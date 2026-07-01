# Estudo: abordagem de UI/styling

Este material apoia a discussão da task 1.2 e documenta a decisão registrada no
`design.md`.

**Decisão:** usar Tailwind CSS como base inicial de UI/styling nesta change, sem
adotar uma biblioteca de componentes neste momento. `shadcn/ui` permanece como
evolução candidata para uma próxima etapa.

## Contexto do projeto

- Frontend atual: Next.js 16, React 19 e Pages Router.
- UI atual: página inicial mínima em `pages/index.tsx`.
- Objetivo imediato: páginas de cadastro/login, estado autenticado/deslogado e
  uma base visual sustentável para o início do produto.
- Restrições desejáveis:
  - evitar uma arquitetura visual pesada cedo demais;
  - preservar compatibilidade com Next.js 16/Turbopack;
  - manter boa acessibilidade;
  - não assumir design system final nesta change;
  - permitir evolução futura sem grande retrabalho.

## Critérios de comparação

| Critério | Pergunta orientadora |
| --- | --- |
| Compatibilidade | Funciona bem com Next.js 16, React 19 e Pages Router? |
| Peso | Adiciona muitas dependências/runtime/providers? |
| Produtividade | Ajuda a criar telas rapidamente? |
| Acessibilidade | Oferece primitives/componentes acessíveis? |
| Controle visual | Facilita criar identidade própria do Bolão? |
| Maturidade | Tem comunidade, documentação e manutenção sólidas? |
| Risco de lock-in | A aplicação fica presa à identidade/API da biblioteca? |
| Evolução | Permite migrar ou complementar com outra solução depois? |

## Quadro comparativo

Escala usada para comparação:

- `5`: melhor aderência ao projeto neste momento.
- `4`: boa aderência, com poucos trade-offs.
- `3`: aceitável, mas exige atenção.
- `2`: fraca aderência para esta etapa.
- `1`: não recomendado para este contexto.

Importante: a nota sempre mede "melhor para este projeto agora". Portanto, em
critérios como peso e lock-in, nota maior significa **menor peso** e **menor
lock-in**.

| Opção | Compat. | Leveza | Produt. | A11y | Controle | Maturid. | Baixo lock-in | Encaixe agora | Leitura curta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| CSS nativo / CSS Modules | 5 | 5 | 3 | 3 | 5 | 5 | 5 | 4 | Ótimo se a prioridade for zero dependência |
| Tailwind CSS | 5 | 4 | 5 | 3 | 5 | 5 | 4 | 5 | Melhor equilíbrio para base inicial flexível |
| shadcn/ui | 4 | 3 | 5 | 5 | 5 | 4 | 3 | 4 | Forte depois de aceitar Tailwind |
| Material UI | 4 | 2 | 5 | 5 | 3 | 5 | 2 | 3 | Completo, mas pesado/opinionado |
| Chakra UI | 4 | 2 | 5 | 5 | 3 | 5 | 3 | 3 | Produtivo, mas adiciona runtime/provider |
| Bootstrap / React Bootstrap | 5 | 3 | 4 | 4 | 2 | 5 | 3 | 3 | Rápido, porém visual tradicional |
| Ant Design | 4 | 2 | 5 | 5 | 2 | 5 | 2 | 2 | Melhor para admin/dashboard complexo |
| Mantine | 4 | 2 | 5 | 5 | 3 | 4 | 3 | 3 | Muito completo, talvez amplo cedo demais |
| Radix UI | 5 | 4 | 3 | 5 | 5 | 5 | 4 | 3 | Excelente base headless, exige styling |
| jQuery UI | 1 | 1 | 2 | 2 | 2 | 3 | 1 | 1 | Não recomendado para React/Next moderno |

Legenda dos critérios:

- `Compat.`: compatibilidade com Next.js 16, React 19 e Pages Router.
- `Leveza`: baixo peso de dependências, runtime e configuração.
- `Produt.`: produtividade para criar telas rapidamente.
- `A11y`: suporte a acessibilidade.
- `Controle`: liberdade para criar identidade visual própria.
- `Maturid.`: maturidade, comunidade e documentação.
- `Baixo lock-in`: menor risco de ficar preso à API/visual da solução.
- `Encaixe agora`: aderência específica à fase atual do projeto.

## Quadro de leitura rápida

| Se a prioridade for... | Opção mais provável | Motivo |
| --- | --- | --- |
| Zero dependência nova | CSS Modules | Usa recursos nativos do Next e CSS |
| Velocidade com liberdade visual | Tailwind CSS | Produtivo sem impor design system |
| Componentes modernos depois de Tailwind | shadcn/ui | Aproveita Tailwind e entrega componentes controláveis |
| Design system corporativo completo | Material UI ou Ant Design | Muitos componentes prontos e padrões fortes |
| Componentes acessíveis com DX alta | Chakra UI ou Mantine | Bibliotecas completas com boa experiência |
| Primitives acessíveis/headless | Radix UI | Base forte para design system próprio |
| Aparência tradicional e rápida | Bootstrap / React Bootstrap | Muito conhecido, rápido para prototipar |
| Compatibilidade com legado jQuery | jQuery UI | Só faria sentido se houvesse legado jQuery |

## Decisão registrada

Tailwind CSS foi escolhido como a melhor opção para esta etapa porque equilibra:

- alta compatibilidade com o stack atual Next.js/React;
- boa produtividade para criar as primeiras telas;
- baixa complexidade em comparação com design systems completos;
- liberdade visual para construir identidade própria do Bolão;
- baixo lock-in em relação a bibliotecas de componentes;
- caminho natural para avaliar `shadcn/ui` no futuro, se o projeto precisar de
  componentes prontos e acessíveis.

Não serão adotados Material UI, Chakra UI, Ant Design ou Mantine nesta change
porque são stacks de componentes mais completas e opinativas do que o necessário
para as primeiras telas de autenticação. Bootstrap/React Bootstrap também não foi
priorizado por impor uma aparência mais tradicional. Radix UI segue interessante
como base headless futura, mas exigiria styling adicional desde o início. jQuery
UI não é recomendado para este stack React/Next moderno.

## Opções avaliadas

### CSS nativo / CSS Modules

Boa opção conservadora: zero dependência nova, suporte nativo no Next.js e baixo
risco. Exige mais trabalho manual para componentes e consistência visual.

**Tende a encaixar quando:** queremos simplicidade máxima, poucas telas e total
controle.

**Risco:** crescer com CSS duplicado/espalhado se não houver convenções cedo.

### Tailwind CSS

Framework utility-first oficialmente documentado pelo Next.js. Oferece alta
produtividade, baixo runtime e boa liberdade visual.

**Tende a encaixar quando:** queremos criar UI rapidamente sem adotar um design
system pronto.

**Risco:** classes longas e inconsistência visual se não houver padrões de
componentes.

### shadcn/ui

Coleção de componentes baseada em Tailwind e primitives modernas. O código dos
componentes entra no projeto, permitindo controle e customização.

**Tende a encaixar quando:** Tailwind já foi aceito e queremos acelerar com
componentes acessíveis e visual moderno.

**Risco:** introduz convenções adicionais; talvez seja cedo antes de confirmar a
base Tailwind.

### Material UI

Design system completo e muito maduro, com muitos componentes prontos e
integração oficial com Next.js.

**Tende a encaixar quando:** precisamos de uma UI rica rapidamente,
especialmente dashboards/admin.

**Risco:** peso maior, dependência de Emotion/configuração e identidade visual
Material forte.

### Chakra UI

Biblioteca de componentes produtiva e acessível, com guia oficial para Next.js
Pages e App Router.

**Tende a encaixar quando:** queremos componentes prontos e theming com boa DX.

**Risco:** adiciona provider/runtime e a própria documentação menciona cuidados
com hidratação/Turbopack em alguns cenários.

### Bootstrap / React Bootstrap

Bootstrap é extremamente maduro e reconhecido no mercado. React Bootstrap adapta
componentes Bootstrap para React.

**Tende a encaixar quando:** queremos velocidade, padrões conhecidos e aparência
convencional.

**Risco:** identidade visual "Bootstrap" e menor liberdade estética sem
customização.

### Ant Design

Biblioteca madura e rica, forte em sistemas administrativos e dashboards.

**Tende a encaixar quando:** o produto exige muitos componentes corporativos,
tabelas, filtros e formulários complexos.

**Risco:** pesada/opinionada para uma UI inicial simples de autenticação e
produto público.

### Mantine

Biblioteca moderna com muitos componentes, hooks e boa experiência de
desenvolvimento.

**Tende a encaixar quando:** queremos uma stack de componentes completa sem
adotar Material.

**Risco:** assume design system/runtime próprio; pode ser mais do que precisamos
para esta etapa.

### Radix UI

Primitives headless acessíveis. Dá controle visual total e boa base para criar
um design system próprio.

**Tende a encaixar quando:** queremos componentes acessíveis sem visual imposto.

**Risco:** exige construir styling e componentes finais por cima; sozinho não
acelera tanto telas simples.

### jQuery UI

Historicamente importante e ainda existente, mas pensado para jQuery, não para
React/Next moderno.

**Tende a encaixar quando:** há legado jQuery a manter.

**Risco:** desalinhado com React, componentes declarativos, SSR/hidratação e a
arquitetura atual do projeto.

## Leitura preliminar

As opções parecem cair em quatro famílias:

```text
Baixo compromisso
├── CSS Modules / CSS nativo
└── Tailwind CSS

Componentes sobre Tailwind/headless
├── shadcn/ui
└── Radix UI

Design systems completos
├── Material UI
├── Chakra UI
├── Ant Design
└── Mantine

Tradicionais/legado
├── Bootstrap / React Bootstrap
└── jQuery UI
```

Para esta change, a discussão provavelmente deve decidir entre:

1. **CSS Modules** se a prioridade for zero dependência.
2. **Tailwind CSS** se a prioridade for produtividade e liberdade visual.
3. **Tailwind CSS agora + avaliar shadcn/ui depois** se quisermos uma ponte
   segura para componentes prontos sem assumir tudo de uma vez.

## Fontes oficiais para consulta

- Next.js CSS/styling:
  <https://nextjs.org/docs/app/getting-started/css>
- Tailwind CSS com Next.js:
  <https://tailwindcss.com/docs/installation/framework-guides/nextjs>
- shadcn/ui com Next.js:
  <https://ui.shadcn.com/docs/installation/next>
- Material UI com Next.js:
  <https://mui.com/material-ui/integrations/nextjs/>
- Chakra UI com Next.js Pages:
  <https://chakra-ui.com/docs/get-started/frameworks/next-pages>
- Bootstrap:
  <https://getbootstrap.com/docs/5.3/getting-started/introduction/>
- React Bootstrap:
  <https://react-bootstrap.netlify.app/docs/getting-started/introduction/>
- Ant Design com Next.js:
  <https://ant.design/docs/react/use-with-next/>
- Mantine com Next.js:
  <https://mantine.dev/guides/next/>
- Radix UI primitives:
  <https://www.radix-ui.com/primitives/docs/overview/getting-started>
- jQuery UI:
  <https://jqueryui.com/>
