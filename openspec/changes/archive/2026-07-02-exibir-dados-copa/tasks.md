## 1. Revisão e baseline

- [x] 1.1 Revisar proposta, design e specs da change `exibir-dados-copa` antes de implementar.
- [x] 1.2 Confirmar que a change anterior `implementar-ui-autenticacao` será arquivada no mesmo PR desta change.
- [x] 1.3 Criar branch da change e registrar baseline leve de estado limpo da main, versão das dependências e validações rápidas aplicáveis; reaproveitar validações completas recentes quando ainda forem representativas.

## 2. Backend: dados autenticados da Copa

- [x] 2.1 Criar estrutura de módulo/service/controller para dados autenticados da Copa.
- [x] 2.2 Implementar consulta autenticada de grupos com seleções ordenadas.
- [x] 2.3 Implementar consulta autenticada de seleções com grupo e `flag_icon_code`.
- [x] 2.4 Implementar consulta autenticada de jogos ordenados por data/hora, incluindo times definidos ou `null`.
- [x] 2.5 Implementar filtro opcional de jogos por fase válida.
- [x] 2.6 Criar DTOs/mappers explícitos para respostas públicas sem retornar entidades TypeORM diretamente.
- [x] 2.7 Proteger endpoints com JWT bearer e validar rejeição de acesso sem token.
- [x] 2.8 Garantir que endpoints autenticados sejam incluídos na documentação OpenAPI.
- [x] 2.9 Adicionar logs de bootstrap, wrapper de `start:dev` e script de execução compilada para indicar/controlar etapas da inicialização do backend.
- [x] 2.10 Configurar Swagger UI para preencher `bearerAuth` automaticamente após respostas de login/cadastro com `accessToken`.

## 3. Frontend: cliente e helpers

- [x] 3.1 Criar cliente/helpers para consumir grupos, seleções e jogos usando `NEXT_PUBLIC_API_URL`.
- [x] 3.2 Criar componente/helper para apresentar `flag_icon_code` como bandeira.
- [x] 3.3 Criar helper para rótulos amigáveis de fase.
- [x] 3.4 Criar helper para formatação de data/hora dos jogos.
- [x] 3.5 Criar helper para separar jogos de fase de grupos e jogos eliminatórios.

## 4. Frontend: tela protegida da Copa

- [x] 4.1 Criar rota `/copa` como página fina protegida por sessão local.
- [x] 4.2 Criar feature `world-cup-data` ou equivalente em `src/features/` para compor a tela.
- [x] 4.3 Criar componentes para grupos e seleções reutilizando componentes de UI existentes quando possível.
- [x] 4.4 Criar componentes para agenda de jogos da fase de grupos, fase, placar e times pendentes.
- [x] 4.5 Criar componente de chaves de confronto para fases eliminatórias agrupadas por fase.
- [x] 4.6 Exibir estado de carregamento, erro, acesso deslogado e dados carregados sem quebrar a página.
- [x] 4.7 Adicionar navegação da home para a tela da Copa apenas no estado autenticado.

## 5. Testes

- [x] 5.1 Atualizar suíte de fundação para validar endpoints autenticados de grupos, seleções e jogos.
- [x] 5.2 Atualizar suíte de fundação para validar renderização básica da rota `/copa`.
- [x] 5.3 Adicionar testes unitários para helpers de bandeira, fase, data e separação de eliminatórias quando viável sem browser.
- [x] 5.4 Garantir build/lint do backend e frontend após os novos endpoints/telas.

## 6. Documentação

- [x] 6.1 Atualizar README com endpoints autenticados de dados da Copa e rota protegida `/copa`.
- [x] 6.2 Atualizar documentação frontend se novos padrões/componentes forem estabelecidos.
- [x] 6.3 Registrar decisões sobre fases, times pendentes, chaves eliminatórias e uso de `flag_icon_code`.
- [x] 6.4 Substituir exemplos/placeholders com nomes próprios por textos genéricos ou explicativos no README, Swagger UI e frontend.

## 7. Archive e fechamento

- [x] 7.1 Sincronizar e arquivar a change pendente `implementar-ui-autenticacao` no mesmo PR desta change.
- [x] 7.2 Sincronizar specs da change `exibir-dados-copa` antes do fechamento.
- [x] 7.3 Arquivar a change `exibir-dados-copa` no mesmo PR de implementação.
- [x] 7.4 Executar formatação, lint, build, testes, auditoria e OpenSpec strict aplicáveis.
- [x] 7.5 Preparar commit/PR com resumo da implementação, decisões e validações.

## 8. Correções pós-reabertura

- [x] 8.1 Mapear problemas encontrados nas telas da change reaberta.
- [x] 8.2 Corrigir UI/UX, estado ou integração das telas afetadas.
- [x] 8.3 Atualizar testes/documentação quando o comportamento corrigido exigir.
- [x] 8.4 Executar validações aplicáveis.
- [x] 8.5 Sincronizar specs, arquivar novamente a change e preparar fechamento.
- [x] 8.6 Sincronizar seed local com placares e jogos eliminatórios definidos/indefinidos da fonte de referência.
- [x] 8.7 Prever e apresentar resultados de decisões por pênaltis em jogos eliminatórios.
- [x] 8.8 Melhorar apresentação de grupos, agenda compacta e origem dos confrontos eliminatórios.
- [x] 8.9 Ajustar agenda para exibir grupo e chaveamento horizontal ordenado por `bracket_order` explícito no seed.
- [x] 8.10 Alinhar visualmente jogos das chaves pelo centro dos confrontos anteriores e apresentar Final antes da Disputa de terceiro lugar.
- [x] 8.11 Ajustar a base visual das chaves dinamicamente conforme a primeira fase visível no scroll horizontal.
- [x] 8.12 Compactar placar por pênaltis, ajustar espaçamento da coluna decisiva e adicionar controles de scroll horizontal nas chaves.
- [x] 8.13 Adicionar destaque visual específico para o jogo da Final.
- [x] 8.14 Refinar altura do placar por pênaltis e calibrar botões de scroll para mover uma fase por vez.
- [x] 8.15 Manter jogos visíveis ao trocar a fase-base durante a navegação horizontal do chaveamento.
