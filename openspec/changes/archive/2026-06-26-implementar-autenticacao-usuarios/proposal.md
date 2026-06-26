## Why

O projeto já possui a tabela `users`, mas ainda não há fluxo funcional para
cadastro, login e identificação de participantes. Autenticação é o primeiro
bloco de produto necessário para liberar palpites, ranking, perfil e regras por
usuário.

## What Changes

- Criar endpoints de cadastro, login e consulta do usuário autenticado.
- Persistir usuários com e-mail único e senha armazenada como hash seguro.
- Emitir credencial de autenticação para chamadas protegidas da API.
- Proteger rotas que dependem de usuário autenticado, começando por uma rota de
  perfil/me.
- Validar payloads de entrada, normalizar e-mail e rejeitar senhas fracas com
  política mínima de 8 caracteres.
- Documentar contratos no OpenAPI e README.
- Exibir a documentação interativa da API em Swagger UI no browser, carregando
  automaticamente os endpoints da especificação OpenAPI.
- Adicionar testes para cadastro, login, falhas de credencial e proteção de rota.
- Não implementar ainda permissões administrativas, recuperação de senha, troca
  de senha, OAuth/social login, MFA ou telas finais no frontend.
- Registrar OAuth/social login e MFA como evoluções desejáveis para changes
  futuras, sem acoplar essas decisões ao login inicial.
- Registrar cookie HTTP-only, refresh token, rate limit/lockout, OAuth social e
  MFA como itens de roadmap para issues/changes futuras.

## Capabilities

### New Capabilities

- `user-authentication`: Cadastro, login, credenciais de acesso, proteção de
  rotas e identificação do usuário autenticado.

### Modified Capabilities

- `project-foundation`: A fundação passa a incluir o fluxo mínimo de usuário
  autenticável sobre a tabela `users`.
- `delivery-foundation`: A documentação OpenAPI, testes e configuração validada
  devem cobrir autenticação e segredos exigidos.

## Impact

- Backend NestJS: novos módulos/controllers/services/guards/DTOs de auth/users.
- Entidade `User` e eventuais índices/constraints já existentes.
- Variáveis de ambiente de autenticação, como segredo e expiração de token.
- Testes unitários/de integração e suíte de fundação.
- OpenAPI, Swagger UI e README.
- Dependências locais de backend para Argon2id, JWT e Swagger UI.
