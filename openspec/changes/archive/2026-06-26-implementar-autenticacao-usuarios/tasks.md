## 1. Revisão de decisões

- [x] 1.1 Revisar e aprovar decisões de autenticação antes de implementar: JWT bearer, ausência inicial de refresh token, algoritmo de hash, política mínima de senha com 8 caracteres, expiração, cadastro retornando token e estratégia de armazenamento no frontend.
- [x] 1.2 Ajustar proposal/design/specs conforme decisões aprovadas.

## 2. Dependências e configuração

- [x] 2.1 Criar branch da change e registrar baseline de `npm ci`, lint, build, testes, foundation e auditoria; Docker build de baseline dispensado por decisão do projeto antes da implementação.
- [x] 2.2 Adicionar dependências de autenticação e hashing escolhidas sem `--force` ou `--legacy-peer-deps`.
- [x] 2.3 Adicionar variáveis de ambiente de autenticação e validação de segredo/expiração.
- [x] 2.4 Atualizar `.env.example`, README e documentação operacional.

## 3. Modelo de usuário e serviços

- [x] 3.1 Criar módulo/serviço de usuários para busca por e-mail, busca por id e criação com e-mail normalizado.
- [x] 3.2 Garantir que respostas públicas de usuário nunca exponham `passwordHash`.
- [x] 3.3 Validar tratamento de e-mail duplicado com erro de conflito.

## 4. Autenticação

- [x] 4.1 Criar módulo de autenticação com DTOs de cadastro e login.
- [x] 4.2 Implementar hashing e verificação de senha com Argon2id; usar bcrypt apenas se houver bloqueio comprovado de instalação/CI.
- [x] 4.3 Implementar validação de senha fraca: mínimo 8 caracteres, letras e números, e bloqueio de senha igual a nome/e-mail normalizados.
- [x] 4.4 Implementar emissão e validação de access token com expiração padrão de 1 hora.
- [x] 4.5 Implementar guard/decorator para usuário autenticado.
- [x] 4.6 Implementar endpoints `POST /auth/register`, `POST /auth/login` e `GET /auth/me`.

## 5. Documentação e OpenAPI

- [x] 5.1 Documentar DTOs, respostas, erros e esquema bearer no OpenAPI.
- [x] 5.2 Substituir a página simples de `/docs` por Swagger UI via dependência local, carregando `/docs-json` automaticamente quando aberto no browser.
- [x] 5.3 Atualizar README com fluxo básico de autenticação, Swagger UI e variáveis necessárias.

## 6. Testes e validação

- [x] 6.1 Adicionar testes de cadastro válido, payload inválido, senha fraca e e-mail duplicado.
- [x] 6.2 Adicionar testes de login válido e credenciais inválidas.
- [x] 6.3 Adicionar testes de rota protegida com token válido, ausente, inválido e expirado.
- [x] 6.4 Adicionar teste para documentação habilitada confirmando `/docs-json` e carregamento da Swagger UI em `/docs`.
- [x] 6.5 Atualizar suíte de fundação para cobrir autenticação sem fragilizar os testes existentes.
- [x] 6.6 Executar `npm ci`, lint, build, cobertura, foundation, Docker build, OpenSpec validate e auditoria zerada; Docker build mantido dispensado conforme decisão do projeto nesta rodada.

## 7. Fechamento

- [x] 7.1 Criar issues ou notas de roadmap para decisões adiadas: refresh token, cookies HTTP-only, OAuth/social login, MFA, senhas comuns/vazadas e rate limiting/lockout/auditoria por tentativas repetidas.
- [x] 7.2 Preparar PR com resumo das decisões aprovadas, implementação e validações.
