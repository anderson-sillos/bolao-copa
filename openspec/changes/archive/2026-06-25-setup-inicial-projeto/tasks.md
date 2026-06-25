# Tarefas: Setup Inicial do Projeto

## Fase 1: Configuração do Monorepo

- [x] Inicializar o `package.json` na raiz do projeto e configurar os `workspaces` do npm para as pastas `apps/*`.
- [x] Criar a estrutura de diretórios `/apps/backend` e `/apps/frontend`.

## Fase 2: Backend (NestJS)

- [x] Na pasta `apps/backend`, criar um novo projeto NestJS.
- [x] Instalar as dependências do NestJS para banco de dados: `@nestjs/typeorm`, `typeorm`, `pg`.
- [x] Configurar o `AppModule` para estabelecer a conexão com o banco de dados PostgreSQL via TypeORM (usar variáveis de ambiente para as credenciais).
- [x] Criar as entidades do TypeORM para `User`, `Team`, `Game`, `Bet` e `Group` conforme definido na proposta.
- [x] Configurar o TypeORM CLI e gerar a migração inicial para criar as tabelas no banco de dados.
- [x] Criar um script de _seeding_ para popular as tabelas `groups`, `teams` e `games` com dados iniciais.

## Fase 3: Frontend (Next.js)

- [x] Na pasta `apps/frontend`, criar um novo projeto Next.js com TypeScript.

## Fase 4: Verificação

- [x] Executar a migração do backend para confirmar que as tabelas são criadas com sucesso.
- [x] Iniciar o servidor do backend e garantir que não há erros de conexão com o banco.
- [x] Iniciar o servidor de desenvolvimento do frontend e garantir que a página inicial é renderizada.

## Fase 5: Correções pós-verificação

- [x] Padronizar `country_code` como código FIFA de três letras no modelo, migrações, especificação e seed.
- [x] Consolidar o schema atualizado em uma única migração inicial e recriar o banco local.
- [x] Substituir `flag_url` por `flag_unicode`, persistindo as sequências ASCII fornecidas pelo seed.
- [x] Corrigir os scripts da CLI TypeORM para funcionar com dependências hoisted pelo npm workspace.
- [x] Nomear explicitamente PKs, uniques e FKs com identificadores legíveis no TypeORM e na baseline.
- [x] Persistir jogos futuros com seleções pendentes usando referências de time opcionais.
- [x] Adicionar testes automatizados para migração, rollback, seed, palpite único e rotas básicas.
- [x] Configurar o Prettier para ignorar artefatos gerados e normalizar os arquivos JSON mantidos pelo projeto.
- [x] Atualizar o README com onboarding, comandos, modelo de dados, testes e solução de problemas.
