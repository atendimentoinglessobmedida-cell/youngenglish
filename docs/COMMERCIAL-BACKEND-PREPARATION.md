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
