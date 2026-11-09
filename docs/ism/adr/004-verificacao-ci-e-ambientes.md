# ADR 004 — verificação comum e publicação controlada por ambiente

**Status:** ACEITO pelo proprietário ao solicitar “Prossiga”, em 09/11/2026. A adoção continua restrita a branches e previews.

## Contexto

Os scripts e ambientes diferem. As suítes existentes já cobrem contratos de currículo, segurança e acesso que não podem ser substituídos por um teste genérico do kit. O Business possui um workflow que publica GitHub Pages em branches históricas. O Travel usa Sites/D1. A configuração remota de projetos não pode ser deduzida apenas dos arquivos de CI.

## Decisão proposta

Criar `npm run verify` como **fachada**, mantendo as suítes de cada app. Um orquestrador Node registra comando, versão, origem, timestamp, duração, saída e contagens; falha em qualquer verificação obrigatória encerra com erro. “Não medido”, “bloqueado” e “não aplicável” não são convertidos em sucesso.

Fases propostas: integridade do kit/lock → lint dos arquivos aplicáveis → testes existentes e unitários do kit → build → schema/assets/links → navegação/a11y/visual quando o ambiente oferecer suporte. Auditar também a saída pública para impedir inclusão de segredos e material Premium privado.

ESLint e formatador terão configuração/versão comum para arquivos adotados. Não reformatar todo o legado num único commit. Cobertura e exceções transitórias serão explícitas. Respeitar engines por app: não forçar a troca do Node 22 do Business para Node 24 apenas para igualar uma configuração.

## Critérios de teste

- Quatro abas, perfil, foco e retorno de navegação; “Continuar” retoma a aula/etapa real e trata ponteiro inválido sem conceder acesso.
- Todos os recursos do inventário têm destino, estado de acesso e caminho de toques registrados; rotas antigas continuam funcionando.
- Capturas pareadas em 360 e 390 px, sem rolagem horizontal, toque mínimo e safe-area; estados vazios, carregamento e erro incluídos.
- Auditoria automatizada de acessibilidade e contraste claro/escuro. Lighthouse medindo o app, nunca a tela de SSO ou erro 404.
- Testes locais usam fixtures, não contas/dados de alunos. Fluxos reais que exigirem credenciais ou aceite legal permanecem bloqueados até a ação apropriada do proprietário.
- Nenhuma aprovação automática de voz/áudio. A revisão humana é uma etapa separada.

## Desempenho

Registrar bytes reais por artefato e rota, JS/CSS/compressão, versão do auditor e configuração do dispositivo/rede. Medições locais não serão apresentadas como tráfego ou métricas de usuários reais. Comparar o mesmo cenário antes/depois e informar os deltas.

Os limites numéricos de orçamento serão definidos após a baseline comparável; não preencher agora com números plausíveis. TTI será marcado “não aplicável” se a versão do Lighthouse não oferecer a métrica. Notas antigas do PageSpeed permanecem históricas e não aprovam um kit novo.

## CI e ambientes

Cada repositório mantém seu projeto/host e recebe o mesmo fluxo de qualidade com adaptadores. Instalação travada por lockfile; lint, testes, build, conteúdo e artefatos; preview somente por contexto autorizado. Branches de trabalho devem evitar nomes que acionem publicações legadas.

Configurações de preview/staging/produção permanecem separadas. `.env.example` contém nomes e finalidade, nunca valores. Não copiar service-role, SMTP, banco ou variáveis de produção para um preview. Fixtures ou recursos de testes devem ser próprios; não transformar falha de configuração em bypass de autorização.

Não alterar a integração Git/produção hospedada sem revisão específica. A promoção será manual, por app, após evidência de QA e aprovação explícita. Um build “Ready” não autoriza associação de domínio. Um novo deploy de produção também não fica autorizado pelo simples fato de ser criado “sem alias”.

## Observabilidade e documentação

Padronizar formato mínimo de erro sem e-mails, códigos, respostas, gravações, tokens ou query strings sensíveis. Reutilizar mecanismos existentes antes de contratar um serviço externo. Implementação de coleta/telemetria exige avaliar privacidade e custo; nenhuma foi ativada aqui.

Documentos futuros: README com mapa, contribuição, adicionar aula, adicionar app, CHANGELOG semântico do kit, style guide e rollback. Um commit por tema, com teste correspondente. A reversão do kit não deve requerer restauração de banco, rotação de credencial ou alteração de assinatura.
