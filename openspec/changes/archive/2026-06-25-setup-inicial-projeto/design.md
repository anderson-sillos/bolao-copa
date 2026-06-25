## Context

O projeto Bolão da Copa precisava de uma base executável para frontend, backend e
persistência. A implementação foi organizada como monorepo npm, com Next.js no
frontend, NestJS no backend e PostgreSQL acessado por TypeORM.

## Goals / Non-Goals

**Goals:**

- Manter frontend e backend no mesmo workspace.
- Configurar o backend para usar PostgreSQL por variáveis de ambiente.
- Representar usuários, grupos, seleções, jogos e palpites no modelo relacional.
- Permitir criação do schema por migração e carga inicial por seed.
- Disponibilizar uma aplicação Next.js inicial executável.

**Non-Goals:**

- Implementar autenticação completa.
- Calcular a pontuação dos palpites.
- Construir a interface final do produto.
- Configurar CI/CD.

## Decisions

### Monorepo com npm workspaces

O repositório usa `apps/*` como workspace para manter frontend e backend
independentes, mas instaláveis a partir da raiz. A alternativa de repositórios
separados foi descartada para reduzir a sobrecarga nesta fase inicial.

### Backend NestJS com TypeORM

NestJS organiza a aplicação backend e TypeORM concentra entidades, conexão,
migrações e seed. As credenciais são fornecidas por variáveis de ambiente para
evitar configuração sensível no código.

A CLI usa o binário `typeorm-ts-node-commonjs` disponibilizado pelo npm no PATH
do workspace. Os scripts não dependem da localização física de `node_modules`,
mantendo compatibilidade com dependências hoisted no monorepo.

### PostgreSQL como banco relacional

O modelo contém relações e restrições de unicidade importantes, incluindo um
único palpite por usuário e jogo. PostgreSQL fornece suporte direto a UUIDs,
chaves estrangeiras e índices únicos.

As constraints recebem nomes explícitos e legíveis no metadata TypeORM e na
baseline, seguindo os prefixos `PK_`, `UQ_` e `FK_`. Isso facilita diagnóstico
no banco sem provocar diferenças artificiais em futuras migrações.

Os códigos das seleções usam o padrão FIFA de três letras, compartilhado entre
as entidades, o seed estático e as referências dos jogos.

As bandeiras são persistidas em `flag_unicode` como sequências ASCII de code
points (`U+...`). O backend preserva esses valores portáveis e a camada de
apresentação é responsável por convertê-los em emoji quando necessário.

### Inicialização por migração e seed

A estrutura do banco é versionada por migração. Grupos, seleções e jogos
iniciais são inseridos por um script de seed baseado em dados estáticos.

Jogos eliminatórios são persistidos mesmo antes da definição dos classificados.
Por isso, `team_a_id` e `team_b_id` são opcionais e recebem as seleções à medida
que o torneio avança. Códigos presentes no seed continuam sendo validados.

Como o projeto ainda está em fase inicial e não possui ambientes com histórico
de schema a preservar, todas as tabelas e relações são criadas por uma única
migração baseline. Mudanças incrementais passam a ser adicionadas após essa
base ser estabilizada.

## Risks / Trade-offs

- Dados estáticos da Copa podem ficar desatualizados → atualizar a fonte do seed
  antes da disponibilização do calendário definitivo.
- A conexão local depende de PostgreSQL disponível → manter configuração
  reproduzível no `docker-compose.yml`.
- A suíte de integração depende de PostgreSQL local via Docker Compose e cria um
  banco isolado `bolao_copa_test`, removido automaticamente ao final.

## Verificação automatizada

O comando `npm run test:foundation` usa o test runner nativo do Node.js para
validar builds, migração e rollback, seed, unicidade de palpites e as rotas
básicas do backend e frontend.

## Migration Plan

1. Instalar as dependências dos workspaces.
2. Configurar as variáveis de ambiente do backend.
3. Iniciar o PostgreSQL.
4. Executar a migração inicial.
5. Executar o seed.
6. Iniciar backend e frontend.

Para rollback do banco, executar a reversão da migração inicial.
