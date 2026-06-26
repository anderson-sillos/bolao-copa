## MODIFIED Requirements

### Requirement: Backend NestJS executável

O sistema SHALL disponibilizar uma aplicação backend NestJS compilável e
executável com a versão TypeScript adotada pela toolchain.

#### Scenario: Compilação do backend

- **WHEN** o comando de build do workspace backend for executado
- **THEN** a aplicação SHALL ser compilada sem erros de TypeScript, decorators ou
  resolução de módulos

### Requirement: Conexão PostgreSQL configurável

O backend SHALL configurar e validar a conexão PostgreSQL por variáveis de
ambiente usando TypeORM. A aplicação NestJS, a CLI de migrations e o seed SHALL
usar uma estratégia de ambiente compatível. A origem permitida pelo CORS e a
porta HTTP SHALL ser configuráveis por ambiente.

#### Scenario: Inicialização com credenciais válidas

- **WHEN** o PostgreSQL estiver disponível e as variáveis de ambiente forem válidas
- **THEN** aplicação, migrations e seed SHALL estabelecer conexão com o banco

#### Scenario: Inicialização com configuração inválida

- **WHEN** uma variável obrigatória estiver ausente ou possuir formato inválido
- **THEN** o backend SHALL falhar antes de aceitar requisições

### Requirement: Frontend Next.js executável

O sistema SHALL disponibilizar uma aplicação frontend Next.js com TypeScript,
uma página inicial renderizável e URL do backend configurável por ambiente.

#### Scenario: Build do frontend

- **WHEN** o comando de build do workspace frontend for executado
- **THEN** a aplicação SHALL ser compilada com a versão TypeScript adotada sem
  erros

#### Scenario: Página inicial

- **WHEN** o servidor frontend estiver em execução e a rota raiz for acessada
- **THEN** uma página inicial SHALL ser renderizada

#### Scenario: URL externa da API

- **WHEN** `NEXT_PUBLIC_API_URL` estiver configurada
- **THEN** o frontend SHALL usar esse valor para acessar o backend

### Requirement: Verificação automatizada da fundação

O projeto SHALL fornecer uma suíte de integração executável pela raiz para
validar a fundação e a compatibilidade da toolchain, incluindo configuração e
health check.

#### Scenario: Execução da suíte de integração

- **WHEN** `npm run test:foundation` for executado com PostgreSQL disponível
- **THEN** build, migration, rollback, seed, unicidade de palpites, configuração,
  health check e rotas básicas SHALL ser validados em um banco isolado
