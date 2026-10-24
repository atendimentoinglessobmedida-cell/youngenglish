# Preparação do backend comercial — 12/10/2026

`server/commercial-policy.mjs` implementa e testa regras de autorização, período manual confirmado, renovação sem perder dias restantes, idempotência, progresso por responsável/perfil e consentimento de acompanhamento. Os preços seguem a tabela atual. O módulo não é enviado ao build público.

Esta é uma base de implementação, não uma assinatura operacional. A interface publicada continua identificando a demonstração. Não foram criadas contas reais, coletados dados de menores, realizadas cobranças nem movidos rascunhos para servidor.

## Integração necessária para ativação

1. Selecionar e conectar o backend dedicado do Young. Não usar tabelas ou credenciais do Business como atalho sem separação explícita.
2. Verificar a sessão no servidor e injetar identidade e permissões: os objetos actor/operator do módulo nunca podem vir diretamente do corpo HTTP ou de metadados editáveis pelo usuário.
3. Vincular perfis de aprendizagem à conta do contratante/responsável, usando apelido em vez de dados pessoais desnecessários. Conferir termos, retenção e autorizações da operação com seu responsável.
4. Salvar confirmação administrativa, licença e operação idempotente na mesma transação, com restrições únicas por pagamento/solicitação. A confirmação do navegador não comprova pagamento.
5. Gravar progresso com comparação atômica de revisão, validar IDs contra o catálogo autorizado e aplicar o consentimento em cada leitura do professor.
6. Transferir conteúdo pago para armazenamento privado, proteger cada endpoint e retirar esse conteúdo do artefato público. Conteúdo já publicado pode ter sido copiado anteriormente.
7. Migrar dados locais apenas após escolha do responsável; validar login, acesso, vencimento, suspensão, conflito, exclusão e retorno em outra sessão.
8. Homologar com contas de teste, aparelhos físicos e piloto autorizado antes de oferecer acesso comercial protegido.

Executar: `node --test tests/commercial-policy.test.mjs`. Fixtures são fictícias e locais. A configuração de hospedagem atual ainda serve o app estático; publicar estes arquivos não cria uma API ou um banco.

## Preparação local ampliada

Em 12/10, o usuário escolheu a organização **Inglês Sob Medida** e depois solicitou continuar apenas a preparação local. Nenhum projeto Supabase foi criado. O conector não disponibilizou `get_cost`; a alternativa no painel exigiu login e aceite dos termos pelo usuário.

Foram acrescentados, sem publicação:

- `server/young-http.mjs`: adaptador de requisições Web, com verificação remota da identidade em `/auth/v1/user`, token do próprio usuário e respostas `private, no-store`. Não usa chave de serviço nem concede permissões a partir de parâmetros do navegador.
- Cinco migrações em `supabase/migrations/`: perfis por responsável, licenças somente para leitura pelo contratante, progresso com comparação atômica de revisão, catálogo de IDs autorizados, confirmação administrativa transacional, permissões de equipe, acompanhamento consentido e feedback.
- `scripts/prepare-young-backend.cjs`: extrai as 96 aulas regulares e 70 Premium atuais, verifica IDs únicos e prepara o catálogo privado e a lista de IDs. Não remove o material da demonstração pública.
- Testes: 44 aprovados, incluindo as regras, o adaptador, áudio, pedagogia e offline. Doze testes executam SQL e RLS em PostgreSQL 18.3 via PGlite 0.5.8. A identidade e os serviços remotos são simulados; isso não certifica a configuração real do Supabase.
- Cache local preparado: APIs, página de conta e requisições autenticadas não são interceptadas pelo service worker; respostas `private` ou `no-store` não são gravadas no cache. Esta alteração isolada de cache foi publicada pelo PR #10 em 12/10/2026; a preparação de backend permanece local.

As cinco migrações passaram na análise de sintaxe SQL e PL/pgSQL com pglast 8.5 e foram executadas em PostgreSQL 18.3 em memória via PGlite. Os testes verificam RLS com papel sem privilégios de superusuário, isolamento, consentimento, exclusão, licença e conteúdo privado. Usam contas fictícias e identidade simulada. Concorrência entre conexões, Auth e configuração efetiva ainda devem ser homologadas no Supabase dedicado.

O catálogo completo e o seed SQL ficam em `server/private/`, ignorado pelo Git. A quinta migração prepara a leitura de conteúdo Premium por RPC autorizada. Isso não remove as cópias existentes no app público; essa remoção continua necessária antes da ativação comercial.

### Contratos preparados

| Ação | Método | Condição |
|---|---|---|
| session | GET | Conta verificada; permissões consultadas no banco |
| profiles | GET / POST | Lista própria; criação por conta verificada, com limite de oito perfis ativos |
| progress | GET / PUT / DELETE | Perfil próprio; revisão atual; envio opcional; confirmação para remover |
| premium | GET | Perfil próprio habilitado e licença ativa dentro do período |
| license | GET | Responsável consulta o período do próprio perfil, inclusive vencido |
| period | POST | Permissão administrativa no banco; plano e valor corretos; operação e referência únicas |
| teacher | GET | Permissão de equipe; apenas perfis habilitados com compartilhamento atual; lista paginada e rascunhos carregados por perfil |
| feedback | GET / POST | Responsável lê os próprios; professor escreve somente com permissão e consentimento |

Essas ações ainda não são URLs operacionais: a fábrica não está montada em uma função Vercel. A remoção apaga textos, atividades e feedbacks e conserva somente uma revisão vazia para impedir que um aparelho antigo restaure uma cópia desatualizada. Licenças e registros administrativos permanecem separados.

### Condições para a próxima ativação

1. Criar o projeto dedicado depois de consultar as condições e resolver a etapa de confirmação do serviço.
2. Aplicar as migrações na ordem; testar RLS e concorrência com contas fictícias, incluindo chamadas diretas à API do banco. Não aplicar no projeto Business.
3. Configurar uma conta de equipe verificada, com os privilégios mínimos necessários na tabela privada. Por padrão, ninguém recebe permissão administrativa ou de professor.
4. Montar a fábrica numa função de servidor e configurar URL, chave publicável e origem confiáveis. Não colocar uma chave de serviço no navegador.
5. Implementar o login do responsável, seleção de perfil e envio/carregamento voluntário do progresso. O contrato completo2 e as migrações6/7 agora preservam XP, respostas, jogos, conquistas e retomada, além de conclusão e textos. Ver `FULL-PROGRESS-CONTRACT.md`. A conexão real continua pendente.
6. Retirar o conteúdo pago do build público e do precache, conservar as amostras abertas e obter o restante pela rota autorizada. A existência de um arquivo em `server/private` não torna privadas as cópias já presentes na demonstração.
7. Homologar a assinatura manual, revogação de compartilhamento, exclusão, conflito e instalação em aparelhos reais antes de oferecer um produto comercial protegido.

Executar localmente: `node scripts/prepare-young-backend.cjs` e `node --test tests/commercial-policy.test.mjs tests/young-http.test.mjs`. Nenhuma cobrança, mensagem ou cadastro real foi efetuado nesta preparação.

A importação do seed completo também foi executada em memória: 70 aulas Premium, 70 IDs únicos, sem dados reais ou publicação.
