## MODIFIED Requirements

### Requirement: Conexão PostgreSQL configurável

O backend SHALL configurar e validar a conexão PostgreSQL por variáveis de
ambiente usando a versão TypeORM adotada. A aplicação NestJS, a CLI de
migrations e o seed SHALL usar uma estratégia de ambiente compatível. A origem
permitida pelo CORS e a porta HTTP SHALL ser configuráveis por ambiente.

#### Scenario: Inicialização com credenciais válidas

- **WHEN** o PostgreSQL estiver disponível e as variáveis de ambiente forem válidas
- **THEN** aplicação, migrations e seed SHALL estabelecer conexão com o banco

#### Scenario: Inicialização com configuração inválida

- **WHEN** uma variável obrigatória estiver ausente ou possuir formato inválido
- **THEN** o backend SHALL falhar antes de aceitar requisições

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação e a compatibilidade da toolchain e da versão TypeORM adotada,
incluindo configuração e health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** build, migration, rollback, seed, unicidade de palpites, configuração,
  health check e rotas básicas SHALL ser validados em um banco isolado
