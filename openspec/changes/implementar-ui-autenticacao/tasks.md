## 1. Revisão e baseline

- [x] 1.1 Revisar e confirmar decisões da change: `localStorage` temporário, Pages Router, sem refresh token/cookie HTTP-only nesta etapa.
- [x] 1.2 Pesquisar e discutir abordagem de UI/styling para o frontend inicial, comparando CSS nativo/CSS Modules, Tailwind CSS, shadcn/ui, Material UI, Chakra UI, Bootstrap/React Bootstrap, Ant Design, Mantine, Radix UI, jQuery UI e outras opções relevantes de mercado.
- [x] 1.3 Registrar a decisão de UI/styling no design antes de implementar as telas.
- [x] 1.4 Criar branch da change e registrar baseline leve de estado limpo da main, versão das dependências e validações rápidas aplicáveis; reaproveitar validações completas recentes da change anterior como referência.

## 2. Organização inicial do frontend

- [x] 2.1 Criar estrutura reutilizável para cliente de API usando `NEXT_PUBLIC_API_URL`.
- [x] 2.2 Criar helpers de autenticação para cadastro, login e perfil autenticado.
- [x] 2.3 Criar storage de sessão para salvar, ler e limpar access token no cliente.
- [x] 2.4 Criar parsing centralizado de erros da API para mensagens de interface.

## 3. Base visual com Tailwind CSS

- [x] 3.1 Instalar dependências do Tailwind CSS no workspace frontend sem `--force` ou `--legacy-peer-deps`.
- [x] 3.2 Configurar Tailwind CSS para o projeto Next.js com Pages Router.
- [x] 3.3 Criar ou ajustar arquivo global de estilos com diretivas/base do Tailwind.
- [x] 3.4 Validar lint e build do frontend após a configuração visual.

## 4. UI de autenticação

- [x] 4.1 Criar página de cadastro com campos nome, e-mail e senha.
- [x] 4.2 Criar página de login com campos e-mail e senha.
- [x] 4.3 Integrar cadastro e login com a API, armazenando token em sucesso.
- [x] 4.4 Exibir erros de validação/autenticação retornados pela API.

## 5. Estado autenticado

- [x] 5.1 Atualizar página inicial para refletir estado deslogado com links para cadastro/login.
- [x] 5.2 Buscar `GET /auth/me` quando houver token salvo e exibir dados públicos do usuário.
- [x] 5.3 Implementar logout local limpando o token e retornando ao estado deslogado.
- [x] 5.4 Limpar sessão local quando o perfil falhar por token inválido ou expirado.

## 6. Testes e documentação

- [x] 6.1 Adicionar ou atualizar testes para helpers de API/storage/erros quando viável sem browser.
- [x] 6.2 Atualizar suíte de fundação para validar páginas de cadastro/login e estado básico da home sem fragilizar os testes.
- [x] 6.3 Atualizar README com fluxo local de autenticação no frontend e decisão temporária de sessão.
- [x] 6.4 Garantir que roadmap mantenha cookie HTTP-only, refresh token e revogação de sessão como evolução futura.
- [x] 6.5 Documentar a política de páginas enxutas e componentes organizados por feature para orientar futuras telas.

## 7. Validação e fechamento

- [x] 7.1 Executar formatação, lint, build, testes e auditoria aplicáveis.
- [x] 7.2 Validar OpenSpec da change em modo strict.
- [x] 7.3 Preparar commit/PR com resumo das decisões, implementação e validações.
