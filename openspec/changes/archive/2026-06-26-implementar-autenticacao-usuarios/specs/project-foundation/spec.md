## MODIFIED Requirements

### Requirement: Modelo de dados inicial

O banco SHALL representar usuários, grupos, seleções, jogos e palpites com UUIDs,
relações e restrições de unicidade descritas na proposta. Usuários SHALL possuir
e-mail único e senha armazenada como hash. As seleções SHALL usar códigos FIFA
de três letras e armazenar a bandeira como sequência Unicode ASCII no campo
`flag_unicode`.

#### Scenario: Criação das tabelas

- **WHEN** a migração inicial for executada em um banco vazio
- **THEN** as tabelas `users`, `groups`, `teams`, `games` e `bets` SHALL ser criadas

#### Scenario: Um palpite por usuário e jogo

- **WHEN** houver tentativa de inserir dois palpites para o mesmo usuário e jogo
- **THEN** o banco SHALL rejeitar o segundo registro pela restrição única

#### Scenario: Usuário com e-mail único

- **WHEN** houver tentativa de criar dois usuários com o mesmo e-mail normalizado
- **THEN** o banco ou a camada de serviço SHALL rejeitar o segundo registro

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação e a compatibilidade da toolchain e da versão TypeORM adotada,
incluindo configuração, autenticação e health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** build, migration, rollback, seed, unicidade de palpites, configuração,
  autenticação, health check e rotas básicas SHALL ser validados em um banco
  isolado
