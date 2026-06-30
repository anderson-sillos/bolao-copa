# User Authentication Specification

## Purpose

Definir os contratos iniciais de cadastro, login, proteção de rotas, emissão de
tokens e tratamento seguro de senhas da API.

## Requirements

### Requirement: Cadastro de usuário

O backend SHALL permitir que uma pessoa crie uma conta de participante com nome,
e-mail e senha válidos.

#### Scenario: Cadastro válido

- **WHEN** `POST /auth/register` receber nome, e-mail e senha válidos
- **THEN** o backend SHALL criar o usuário, armazenar apenas o hash da senha e
  retornar dados públicos do usuário e um access token

#### Scenario: E-mail duplicado

- **WHEN** `POST /auth/register` receber e-mail já cadastrado
- **THEN** o backend SHALL rejeitar a requisição com conflito

#### Scenario: Payload inválido

- **WHEN** `POST /auth/register` receber e-mail inválido, nome vazio ou senha
  abaixo da política mínima
- **THEN** o backend SHALL rejeitar a requisição antes de persistir dados

### Requirement: Política mínima de senha

O backend SHALL rejeitar senhas fracas no cadastro usando uma política mínima
explícita.

#### Scenario: Senha curta

- **WHEN** `POST /auth/register` receber senha com menos de 8 caracteres
- **THEN** o backend SHALL rejeitar a requisição antes de persistir dados

#### Scenario: Senha sem letras ou números

- **WHEN** `POST /auth/register` receber senha sem ao menos uma letra e um número
- **THEN** o backend SHALL rejeitar a requisição antes de persistir dados

#### Scenario: Senha derivada de dados pessoais

- **WHEN** `POST /auth/register` receber senha igual ao e-mail ou ao nome
  normalizados
- **THEN** o backend SHALL rejeitar a requisição antes de persistir dados

### Requirement: Login de usuário

O backend SHALL autenticar usuário por e-mail e senha e emitir credencial de
acesso quando as credenciais forem válidas.

#### Scenario: Login válido

- **WHEN** `POST /auth/login` receber e-mail e senha corretos
- **THEN** o backend SHALL retornar um access token e dados públicos do usuário

#### Scenario: Credenciais inválidas

- **WHEN** `POST /auth/login` receber e-mail inexistente ou senha incorreta
- **THEN** o backend SHALL rejeitar a requisição com erro genérico de
  autenticação

#### Scenario: Tentativas repetidas com senha incorreta

- **WHEN** `POST /auth/login` receber repetidas tentativas inválidas
- **THEN** o backend SHALL manter resposta genérica e SHALL NOT revelar se o
  e-mail existe ou se a senha está incorreta

### Requirement: Senha protegida

O backend SHALL armazenar senhas apenas como hash seguro e SHALL impedir que o
hash seja exposto em respostas HTTP.

#### Scenario: Persistência de senha

- **WHEN** um usuário for cadastrado
- **THEN** o valor persistido em `password_hash` SHALL ser diferente da senha em
  texto puro e verificável pelo algoritmo escolhido

#### Scenario: Resposta pública

- **WHEN** qualquer endpoint de autenticação ou perfil retornar dados do usuário
- **THEN** a resposta SHALL omitir `passwordHash` e qualquer segredo equivalente

### Requirement: Rotas autenticadas

O backend SHALL proteger rotas que exigem usuário autenticado usando credencial
bearer válida.

#### Scenario: Perfil autenticado

- **WHEN** `GET /auth/me` receber `Authorization: Bearer <token válido>`
- **THEN** o backend SHALL retornar os dados públicos do usuário autenticado

#### Scenario: Token ausente

- **WHEN** `GET /auth/me` for chamado sem token
- **THEN** o backend SHALL rejeitar a requisição como não autorizada

#### Scenario: Token inválido ou expirado

- **WHEN** `GET /auth/me` receber token inválido ou expirado
- **THEN** o backend SHALL rejeitar a requisição como não autorizada

### Requirement: Configuração de autenticação

O backend SHALL validar configuração obrigatória de autenticação antes de
iniciar.

#### Scenario: Configuração válida

- **WHEN** o backend iniciar com segredo válido e expiração de token de 1 hora
- **THEN** a aplicação SHALL aceitar cadastro, login e validação de token

#### Scenario: Segredo ausente ou fraco

- **WHEN** o backend iniciar sem segredo de autenticação válido
- **THEN** a aplicação SHALL falhar antes de aceitar requisições

### Requirement: Documentação da autenticação

O backend SHALL documentar endpoints e esquema de autenticação para consumo por
clientes.

#### Scenario: OpenAPI

- **WHEN** a documentação OpenAPI estiver habilitada
- **THEN** cadastro, login, perfil autenticado e esquema bearer SHALL aparecer na
  especificação e na interface Swagger UI

### Requirement: Mensagens de validação localizadas

O backend SHALL retornar mensagens de validação de autenticação em português e
com vocabulário controlado pelo projeto, mesmo usando `class-validator`.

#### Scenario: E-mail inválido no login

- **WHEN** `POST /auth/login` receber e-mail em formato inválido
- **THEN** o backend SHALL rejeitar a requisição com mensagem em português para
  e-mail inválido

#### Scenario: E-mail inválido no cadastro

- **WHEN** `POST /auth/register` receber e-mail em formato inválido
- **THEN** o backend SHALL rejeitar a requisição com mensagem em português para
  e-mail inválido

#### Scenario: Mensagens centralizadas

- **WHEN** DTOs de autenticação declararem validações recorrentes
- **THEN** as mensagens SHALL ser obtidas de helpers ou decorators centralizados
  do projeto, evitando strings genéricas ou em inglês espalhadas pelos DTOs
