## Context

O backend usa `class-validator` com `ValidationPipe` global para validar DTOs, o
Helmet aplica uma Content Security Policy padrão e a documentação `/docs` é
servida por um controlador próprio com assets locais da Swagger UI. O projeto
também roda preferencialmente pelo WSL, mas a configuração inicial de debug do VS
Code executava `npm` pelo ambiente do host quando o VS Code era aberto no
Windows.

Algumas melhorias já foram identificadas durante uso local:

- mensagens automáticas do `class-validator` aparecem em inglês;
- o script inline da Swagger UI é bloqueado por `script-src 'self'`;
- o debug precisa iniciar processos no WSL para usar Node/npm/dependências do
  ambiente Linux do projeto.

## Goals / Non-Goals

**Goals:**

- Manter `class-validator`, mas tornar as mensagens de validação claras e em
  português.
- Preparar uma estrutura central para mensagens/decorators de validação, evitando
  strings genéricas ou espalhadas pelos DTOs.
- Corrigir a Swagger UI sem enfraquecer a CSP com `unsafe-inline`.
- Versionar configurações de debug que iniciem backend e frontend via WSL.
- Cobrir as mudanças com validações automatizadas proporcionais.

**Non-Goals:**

- Alterar o formato global de erro da API nesta change.
- Implementar internacionalização dinâmica por idioma do usuário.
- Alterar autenticação, tokens, banco de dados ou migrations.
- Trocar a solução de documentação OpenAPI.

## Decisions

- **Mensagens em português no class-validator:** usar mensagens explícitas nos
  DTOs atuais e evoluir para helpers/decorators centralizados em
  `apps/backend/src/common/validation/` nesta change. Isso preserva a integração
  nativa do NestJS e evita substituir o mecanismo de validação.
- **`common/validation` como fronteira compartilhada:** manter regras de negócio
  específicas em seus módulos, mas colocar mensagens e decorators técnicos
  reutilizáveis em `common/validation`. A autenticação passa a consumir esses
  helpers sem trazer dependência circular entre `auth` e outros módulos.
- **Sem `unsafe-inline` na CSP:** mover o inicializador da Swagger UI para um
  asset JavaScript local servido por `/docs/swagger-ui-init.js`. Assim
  `script-src 'self'` continua suficiente.
- **Debug por attach + tasks WSL:** usar tasks do VS Code chamando `wsl.exe` para
  iniciar os processos e configurações `attach` nas portas do Node Inspector. É
  mais confiável do que tentar um `launch` direto pelo Windows quando o runtime
  real está no WSL.
- **Versionar somente configurações compartilháveis:** permitir
  `.vscode/launch.json` e `.vscode/tasks.json`, mantendo demais arquivos locais
  da pasta `.vscode` ignorados.

## Risks / Trade-offs

- **Mensagens ainda não estruturadas por campo** → mitigar mantendo o escopo em
  mensagens localizadas agora e registrando evolução futura do formato global se
  necessário.
- **Caminho WSL fixo em `/mnt/c/Projetos/bolao-copa`** → aceitável para o setup
  atual do projeto; se o repositório mudar de local, a configuração deverá ser
  ajustada ou parametrizada.
- **Swagger UI depende de ordem de scripts** → mitigar mantendo bundle e
  inicializador como scripts externos carregados em sequência.
- **`common` virar pasta genérica demais** → mitigar limitando esta change a
  validação técnica compartilhada; reorganizações maiores ficam registradas no
  roadmap técnico.
