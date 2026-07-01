# Frontend

Este documento registra convenções iniciais para manter o frontend previsível
conforme novas telas forem adicionadas.

## Organização de páginas e componentes

O projeto usa Next.js com Pages Router. Arquivos em `apps/frontend/pages/` devem
ser pontos de rota enxutos, responsáveis principalmente por compor a tela.

Evite concentrar em uma página:

- layout extenso;
- estado de formulário;
- chamadas de API;
- tratamento de erros;
- componentes que serão reutilizados por outras telas.

A estrutura recomendada é:

```text
apps/frontend/src/
├── components/
│   ├── ui/          # Componentes genéricos sem regra de negócio
│   └── layout/      # Layouts compartilhados da aplicação, quando existirem
├── features/
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
└── lib/             # Utilitários técnicos compartilhados
```

Use `src/features/<feature>/` para componentes e lógica com semântica de uma
área funcional. Use `src/components/ui/` para componentes genéricos, como
botões, campos e alertas. Quando um componente criado dentro de uma feature
passar a ser útil para outras áreas sem depender da semântica original, promova-o
para `src/components/`.

## Autenticação no frontend

O fluxo atual é intencionalmente simples para validar a integração ponta a ponta:

- cadastro chama `POST /auth/register`;
- login chama `POST /auth/login`;
- ambos salvam o access token no cliente e redirecionam para `/`;
- a home lê o token salvo e chama `GET /auth/me`;
- logout remove o token localmente;
- token inválido ou expirado limpa a sessão local e retorna ao estado deslogado.

O token é persistido temporariamente em `localStorage`. Essa decisão é aceita
apenas para o estágio inicial do projeto. Antes de produção, a estratégia deve
evoluir para sessão baseada em cookie seguro/HTTP-only, refresh token e revogação
server-side, conforme registrado no roadmap.
