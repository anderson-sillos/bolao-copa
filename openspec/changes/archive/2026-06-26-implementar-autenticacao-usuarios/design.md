## Context

O backend já possui entidade, migration e constraint única para `users.email`,
incluindo o campo `password_hash`, mas ainda não há módulo de usuários,
autenticação ou rotas protegidas. A API já usa NestJS 11, TypeORM 1.0,
validação centralizada de ambiente, Helmet, CORS configurável, OpenAPI manual e
testes de fundação com PostgreSQL real. Atualmente `/docs` renderiza uma página
HTML simples e `/docs-json` expõe o documento OpenAPI.

Autenticação será a primeira camada funcional do produto. As decisões abaixo
devem ser revisadas antes da implementação porque afetam segurança,
experiência de usuário e integrações futuras, como palpites e ranking.

## Goals / Non-Goals

**Goals:**

- Permitir cadastro de participante com nome, e-mail e senha.
- Permitir login com e-mail e senha.
- Armazenar senha somente como hash seguro.
- Emitir credencial bearer para chamadas autenticadas.
- Expor rota autenticada para obter o usuário atual.
- Validar payloads, normalizar e-mail e tratar erros sem vazar dados sensíveis.
- Documentar contratos no OpenAPI, Swagger UI e README.
- Cobrir cadastro, login, rota protegida e falhas em testes.

**Non-Goals:**

- Recuperação de senha.
- Confirmação de e-mail.
- Refresh token.
- OAuth/social login.
- MFA.
- Papéis administrativos e autorização granular.
- Telas finais do frontend.
- Rate limiting/lockout persistente; pode entrar em change separada.

## Decisions

### Credencial inicial via JWT bearer stateless

A API deverá emitir um access token JWT assinado por segredo de ambiente. O
cliente enviará `Authorization: Bearer <token>` nas chamadas protegidas.

Racional: é simples para API REST, funciona bem com frontend separado e não
exige tabela adicional de sessões neste estágio inicial. Também destrava rápido
as próximas features de palpites.

Alternativas consideradas:

- Sessão com cookie HTTP-only: melhor para algumas proteções de navegador, mas
  exige decisões adicionais de CSRF, domínio e SameSite logo cedo.
- Tokens opacos persistidos em banco: bom para revogação, mas adiciona tabela e
  fluxo de expiração/revogação fora do escopo inicial.

### Sem refresh token nesta primeira entrega

O token inicial deverá expirar em 1 hora, com configuração por ambiente. Quando
expirar, o usuário fará login novamente. Refresh token e rotação ficam para
change posterior, quando a experiência real do frontend estiver mais clara.

Racional: reduz superfície de segurança e evita criar persistência de sessões
antes de existir necessidade concreta.

### Cookie HTTP-only, OAuth/social login e MFA ficam como evolução futura

Cookie HTTP-only, login social via OAuth e autenticação multifator são
desejáveis para maturidade do produto, mas não entram na primeira entrega. A
implementação inicial deve manter o modelo simples de usuário local com
e-mail/senha e token bearer sem bloquear uma futura associação de provedores
externos ou fatores adicionais.

Racional: cookies, OAuth e MFA introduzem decisões próprias de UX, CSRF,
provedores, callback, armazenamento de identidade externa, recuperação de conta
e risco operacional. Separar isso evita superdimensionar a fundação antes de
validar o fluxo básico.

### Política mínima de senha entra na primeira entrega

Cadastro deverá rejeitar senhas com menos de 8 caracteres, senhas sem pelo menos
uma letra e um número, e senhas iguais ao nome ou e-mail normalizados. A regra
evita senhas obviamente fracas sem impor combinações excessivamente rígidas que
costumam induzir padrões previsíveis.

Alternativas consideradas:

- Exigir maiúscula, minúscula, número e símbolo: descartado por gerar atrito e
  senhas previsíveis sem ganho proporcional nesta fase.
- Consultar lista de senhas vazadas/comuns: desejável, mas fica para evolução
  futura por exigir dependência, lista local ou integração externa.

### Bloqueio por tentativas repetidas fica como proteção futura

Nesta primeira entrega, falhas de login deverão responder de forma genérica e
não revelar se o e-mail existe. Bloqueio persistente por usuário/IP, auditoria de
tentativas e rate limiting dedicado ficam para change separada.

Racional: lockout real exige decisões de janela de tempo, quantidade de
tentativas, escopo por IP/usuário, desbloqueio, auditoria e comportamento em
múltiplas instâncias. Implementar isso cedo demais pode permitir abuso para
bloquear contas de terceiros.

Como é uma definição de roadmap de segurança, a conclusão desta change deverá
registrar issue futura específica para rate limiting/lockout/auditoria de
tentativas de login.

### Hash de senha com algoritmo próprio para senhas

Senhas devem ser armazenadas com Argon2id, desde que a dependência instale de
forma reproduzível no Node 24, Docker e CI sem `--force` ou
`--legacy-peer-deps`. Se Argon2id introduzir atrito nativo comprovado, bcrypt
será o fallback pragmático.

Racional: Argon2id é adequado para password hashing moderno; o fallback mantém a
entrega possível sem reduzir a validação de instalação.

### E-mail normalizado e resposta sem `passwordHash`

E-mails deverão ser normalizados para minúsculas e trim antes de persistir e
autenticar. A API nunca deverá serializar `passwordHash` em respostas.

### Validação por DTOs e erros consistentes

Endpoints deverão validar formato de e-mail, tamanho de nome e força mínima de
senha. Falha de login deve retornar erro genérico para evitar enumeração de
contas; cadastro duplicado pode retornar conflito sem expor detalhes internos.

### Segredos por ambiente validado

O backend deverá validar novas variáveis obrigatórias de autenticação, como
`AUTH_JWT_SECRET` e `AUTH_TOKEN_EXPIRES_IN`. Segredos fracos ou ausentes devem
falhar na inicialização.

### Documentação interativa com Swagger UI

Quando `API_DOCS_ENABLED=true`, a rota `/docs` deverá apresentar Swagger UI no
browser e carregar automaticamente a especificação de `/docs-json`, exibindo os
endpoints disponíveis sem exigir abertura manual do JSON. A rota `/docs-json`
deverá continuar disponível para validações automatizadas e integrações.

Racional: Swagger UI facilita revisão dos primeiros endpoints, validação visual
dos contratos e testes manuais controlados durante a fundação do produto.
Swagger UI deverá ser servido por dependência local do projeto, não por CDN, para
manter build reproduzível, funcionamento local/offline e independência de
runtime externo.

Alternativas consideradas:

- Manter HTML simples com link para JSON: insuficiente para revisar DTOs,
  autenticação bearer e respostas de erro com boa ergonomia.
- Gerar documentação somente em build externo: desnecessário nesta fase e menos
  útil para desenvolvimento local.

### Módulos separados de `users` e `auth`

`users` deverá concentrar acesso à entidade e regras de usuário. `auth` deverá
concentrar cadastro/login, assinatura/verificação de token e guard. Isso reduz
acoplamento quando palpites passarem a depender do usuário autenticado.

### Cadastro retorna token automaticamente

`POST /auth/register` deverá retornar o usuário público e um access token, assim
como o login. Isso simplifica a experiência inicial: criou a conta, já entra
autenticado.

## Risks / Trade-offs

- [JWT sem revogação imediata] → Usar expiração configurável e planejar refresh
  token/revogação quando houver necessidade real.
- [Segredo fraco em ambiente local/CI] → Validar tamanho mínimo e documentar
  geração segura.
- [Enumeração de usuários por mensagens de erro] → Usar erro genérico no login e
  limitar detalhes nas respostas.
- [Senhas fracas em contas reais] → Aplicar política mínima desde o cadastro e
  planejar checagem de senhas comuns/vazadas em evolução futura.
- [Ataques de força bruta antes de lockout persistente] → Manter respostas
  genéricas agora e planejar rate limiting/lockout/auditoria em change dedicada.
- [Dependência nativa de hash falhar em Docker/CI] → Validar instalação limpa,
  Docker build e CI antes de aprovar algoritmo.
- [Dados sensíveis em logs/OpenAPI] → Nunca serializar `passwordHash`; marcar
  campos de senha como write-only quando documentados.
- [Swagger UI expor documentação em ambiente indevido] → Manter exposição
  controlada por `API_DOCS_ENABLED` e documentar configuração por ambiente.

## Migration Plan

1. Revisar e aprovar decisões deste design antes de implementar.
2. Criar branch da change.
3. Adicionar dependências de auth/hash somente após confirmar instalação limpa.
4. Adicionar variáveis de ambiente e validação.
5. Criar módulos `users` e `auth`.
6. Implementar DTOs, services, controller, guard e estratégia de autenticação.
7. Adicionar testes unitários/de integração, OpenAPI e Swagger UI.
8. Executar `npm ci`, lint, build, cobertura, foundation, Docker build,
   auditoria e OpenSpec validate.

Rollback: remover módulos/dependências/variáveis adicionadas. A tabela `users`
já existe, então a change não deve exigir rollback de schema, salvo se a revisão
decidir adicionar colunas.

## Open Questions

- Quais provedores OAuth sociais serão priorizados futuramente?
- Qual tipo de MFA faz mais sentido para o produto: TOTP, e-mail, SMS ou
  passkeys?
- Quando implementar proteção contra abuso de login: rate limit por IP, lockout
  por conta, ambos, ou uma solução híbrida?
