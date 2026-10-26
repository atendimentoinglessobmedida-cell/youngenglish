# ISM Comercial Zero Custo — validação técnica

Data: 26/10/2026. Estado: homologação local; lançamento comercial não liberado.

## Resultado por projeto
| Projeto | Implementado e verificado | Limite atual |
|---|---|---|
| Business — PR #51 | Fonte estática recuperada de d5e23473993e599b465d5fa4eb6a1075ee0dbd68, branch feat/owner-administrator. QA e build estático passam. Solicitação WhatsApp e navegação adicionadas. Conteúdo privado continua excluído do dist. Removida autenticação administrativa por chave compartilhada; exige proprietário verificado. Ativação, extensão e reativação ficam bloqueadas. | A recuperação é da aplicação estática, não do Next.js V14. O pacote V14 permanece corrompido e preservado para investigação. Funções modificadas somente em fonte; não publicadas. Fluxo bancário transacional Business ainda pendente. |
| Easy — PR #7 | Instalação limpa npm 10.9.2, build Next 16.3.4 e 73 testes de regressão. Corrigido lockfile ausente de dependência peer do Cloudflare. Ativação por código exige professor autenticado, conferência bancária explícita e referência única. Auditoria, licença e invalidação de sessões gravadas numa transação. Duplicidade rejeitada; falha reverte operação; renovação preserva prazo. Adicionada página HTML para corrigir link da versão estática. | Nova migração 0004 não aplicada em banco real. ISM_MANUAL_PIX_ENABLED fica ausente: ativações retornam 503 por padrão. Banco real, credenciais de homologação e teste de concorrência entre pagamentos distintos ainda precisam validação. Não ativar a flag até aprovar preços, hospedagem e operação. |
| Young — PR #31 | Check e build passam: 76 arquivos, 13 páginas, 24 scripts. Removidos preços antigos da assinatura e do Premium. Responsável solicita pelo WhatsApp. | Demonstração estática; conteúdo Premium é público no navegador. Ainda não existe autorização comercial no servidor. Projeto Supabase ISM Young foi identificado, sem alterações. |
| Travel — PR #6 | 9 testes do material didático e sintaxe dos scripts passam. Página acesso.html e link de entrada revisados em navegador. | Arquitetura estática sem etapa de build. Conteúdo embutido e sessão em localStorage não são proteção de conteúdo pago; migração para entrega autenticada no servidor permanece necessária. |

## Evidências
- Business: scripts/qa-static.mjs, incluindo três testes funcionais de autorização administrativa; saída final All static QA checks passed.
- Easy: npm ci --ignore-scripts --no-audit --no-fund passou após ajuste do lockfile; node scripts/build-vercel.mjs passou; 73 testes da suíte de segurança e regressão.
- Young: node scripts/build.cjs --check e node scripts/build.cjs passaram.
- Travel: node --test .ci/classroom.test.cjs: 9/9; scripts externos e inline analisados sintaticamente.
- Navegador Chrome local, largura 390px: quatro CTAs corretos, link inicial válido, sem erro de JavaScript, sem transbordamento horizontal. Preços ausentes nas telas comerciais revisadas de Business, Easy e Young. Nenhuma mensagem foi enviada. Requisições externas bloqueadas durante a inspeção.
- browser-qa.json e quatro screenshots acompanham este relatório. Estes checks não comprovam operações em bancos reais.

## Integridade e recuperação do Business
O blob original de .ci/ism-business-cert-source-v14.tar.gz tem 15009 bytes; SHA-256 77dd6590edafe2342ae7f04968f5e2dea1a71a645fab7e4bc5bd4941a7ad63a4. Tanto tar quanto zlib falham; o blob obtido diretamente do Git também falha com invalid distance too far back. A versão anterior tampouco descompacta. A aplicação estática de branch existente foi validada isoladamente antes de ser restaurada na branch comercial. Nenhum arquivo de produção foi alterado.

## Infraestrutura inspecionada, somente leitura
- Equipe Vercel equipesonar-1862: Business, Business evaluation, Young, Travel produção e Travel staging. Easy não apareceu na listagem dessa equipe; não inferir que não existe em outra conta.
- Supabase bfuoykappwybuxdlrbmo e pttmctaxklaotdvnmjqc ativos e saudáveis. No primeiro, funções de acesso, administração e gateway Premium existem.
- Advisor de segurança: cinco informações de RLS habilitado sem políticas (compatível com acesso exclusivo por backend, mas requer conferência dos privilégios); um aviso de proteção contra senhas vazadas desabilitada. Nenhuma configuração alterada.
- Não foram consultados registros de alunos, pagamentos ou segredos de ambiente.

## Proteção de produção e custo
Branch de trabalho: feature/ism-comercial-pix-manual. PRs permanecem draft. Sem merge, deploy manual, aplicação de migração, cobrança, contratação ou emissão de licença real.
Cada vercel.json bloqueia deploy Git automático somente para essa branch. Outras branches não são desabilitadas. O workflow antigo do Business que podia fazer push em main foi substituído por verificação manual somente leitura; QA do PR não usa o pacote corrompido.
Previews são locais. A documentação Vercel restringe Hobby a uso pessoal não comercial: https://vercel.com/docs/plans/hobby . Configuração oficial por branch: https://vercel.com/docs/project-configuration/git-configuration . Nenhuma hospedagem comercial alternativa foi provisionada ou certificada nesta etapa.

## Pendências para lançamento
1. Validar hospedagem com uso comercial permitido e custo máximo zero; não migrar domínio nem produção automaticamente.
2. Aprovar condições e preços com o proprietário; chave Pix somente em atendimento privado.
3. Preparar banco isolado para homologação, aplicar migração Easy 0004 e testar com dados fictícios. Validar concorrência, autorização e renovação no banco usado em produção.
4. Implementar registro bancário transacional no backend Business e entregar conteúdo pago do Young e Travel exclusivamente após autorização do servidor.
5. Revisar funções efetivamente implantadas; diferenças na fonte recuperada não significam atualização do backend atual.
6. Validar privacidade do fluxo para responsáveis, usuários de teste e autorização administrativa antes de lançar.

## Operação e rollback
Comprovante enviado não é prova de crédito. O operador precisa conferir no extrato e informar referência interna sem dados bancários sensíveis. Não registrar chave Pix, CPF, senha ou imagem de comprovante no repositório.
Para rever esta etapa, use os PRs draft. Como nada foi integrado nem publicado, produção continua na revisão anterior. Se uma futura homologação aplicar 0004, preservar auditoria e reverter código por commit; não apagar registros bancários como rollback. Manter ISM_MANUAL_PIX_ENABLED ausente durante revisão.
