# Frontend Authentication Specification

## Purpose

Definir os contratos iniciais das telas e helpers de autenticação no frontend.

## Requirements

### Requirement: Página de cadastro

O frontend SHALL permitir que uma pessoa crie uma conta usando nome, e-mail e
senha.

#### Scenario: Cadastro válido

- **WHEN** a pessoa preencher nome, e-mail e senha válidos e enviar o formulário
- **THEN** o frontend SHALL chamar `POST /auth/register`, armazenar o access
  token retornado e atualizar a interface para estado autenticado

#### Scenario: Erro de cadastro

- **WHEN** a API rejeitar o cadastro por payload inválido ou e-mail duplicado
- **THEN** o frontend SHALL exibir uma mensagem compreensível baseada na resposta
  da API

### Requirement: Página de login

O frontend SHALL permitir autenticação por e-mail e senha.

#### Scenario: Login válido

- **WHEN** a pessoa preencher e-mail e senha válidos e enviar o formulário
- **THEN** o frontend SHALL chamar `POST /auth/login`, armazenar o access token
  retornado e atualizar a interface para estado autenticado

#### Scenario: Login inválido

- **WHEN** a API rejeitar o login por payload inválido ou credenciais incorretas
- **THEN** o frontend SHALL exibir uma mensagem compreensível baseada na resposta
  da API

### Requirement: Sessão temporária no cliente

O frontend SHALL manter uma sessão temporária baseada em access token no cliente
para validar o fluxo ponta a ponta.

#### Scenario: Token persistido

- **WHEN** cadastro ou login retornar access token
- **THEN** o frontend SHALL persistir o token localmente para reutilização em
  chamadas autenticadas

#### Scenario: Perfil autenticado

- **WHEN** houver token persistido e a aplicação precisar identificar o usuário
- **THEN** o frontend SHALL chamar `GET /auth/me` com `Authorization: Bearer
  <token>` e exibir dados públicos do usuário autenticado

#### Scenario: Token inválido ou expirado

- **WHEN** `GET /auth/me` falhar por token inválido ou expirado
- **THEN** o frontend SHALL limpar a sessão local e exibir estado deslogado

#### Scenario: Logout local

- **WHEN** a pessoa acionar logout
- **THEN** o frontend SHALL remover o token local e atualizar a interface para
  estado deslogado

### Requirement: Navegação por estado de autenticação

O frontend SHALL refletir visualmente se há usuário autenticado ou não.

#### Scenario: Usuário deslogado

- **WHEN** não houver sessão válida
- **THEN** a interface SHALL oferecer caminhos para cadastro e login

#### Scenario: Usuário autenticado

- **WHEN** houver sessão válida
- **THEN** a interface SHALL exibir identificação básica do usuário e ação de
  logout

### Requirement: Tratamento de erros de API

O frontend SHALL converter respostas de erro da API em mensagens úteis para a
interface.

#### Scenario: Mensagem em array

- **WHEN** a API retornar `message` como array de strings
- **THEN** o frontend SHALL exibir as mensagens de forma legível

#### Scenario: Mensagem simples

- **WHEN** a API retornar `message` como string
- **THEN** o frontend SHALL exibir a mensagem de forma legível

#### Scenario: Erro inesperado

- **WHEN** a API estiver indisponível ou retornar formato inesperado
- **THEN** o frontend SHALL exibir mensagem genérica de falha sem quebrar a tela
