# Conteúdo comercial protegido — candidato de homologação

O site de demonstração e o build padrão continuam preservados. Este pacote separado protege o aplicativo inteiro, incluindo HTML e JavaScript, antes de entregar o conteúdo. Não converte a demonstração pública já existente em um serviço comercial.

## Construir e testar

```text
node scripts/build-commercial.mjs
node --test server/content-gateway.test.mjs server/commercial-package.test.mjs
```

O build gera `commercial-build/public/` (marketing e login), `commercial-build/private/` (aplicativo completo) e um manifesto. Não publicar `commercial-build/` inteiro, não mover `private/` para a pasta pública e não usar o build estático de demonstração para vender conteúdo restrito. O build pode substituir somente seu próprio pacote gerado, identificado pelo manifesto.

O módulo `content-gateway.mjs` recebe uma Request e devolve Response. Precisa de um adaptador para o runtime de hospedagem escolhido e acesso privado ao pacote. Usa APIs de arquivos Node.js; não foi certificado para Workers/Pages e não está implantado.

## Contrato do provedor privado

`createGateway` exige origem HTTPS exata, chave de assinatura exclusiva mantida no servidor, pastas públicas/privadas separadas e um provedor com:

- `verifyCredentials({email,code,app})`: retorna `{subject}` apenas após conferir credenciais no servidor, sem confiar em headers de identidade ou localStorage.
- `getLicense({subject,app})`: retorna `{subject,app,status,startsAt,expiresAt}` atuais. Datas são obrigatórias, o início precisa ter passado e o vencimento precisa ser futuro. Só `ACTIVE` autoriza.
- `createSession({id,subject,app,expiresAt})`, `getSession({id,subject,app})` e `revokeSession({id,subject,app})`: persistência privada e durável de sessões. Consultas devem restringir titular e aplicativo. Falhas devem lançar erro. Sessões ausentes, revogadas ou com dados divergentes não autorizam conteúdo.

Os testes usam somente credenciais fictícias e Map local; esse provedor de teste não é um backend para produção. Não há implementação permissiva por padrão. Mesmo com um provedor válido, `enabled` é falso por padrão. Não habilitar em ambiente real até concluir os itens abaixo.

## Controles implementados e testados

- Sessão de até 15 minutos em cookie HttpOnly/Secure/SameSite=Strict, assinatura HMAC e audiência por aplicativo.
- Verificação da sessão e da licença no servidor a cada arquivo privado. Suspensão, vencimento e revogação bloqueiam novos pedidos.
- Logout revoga a sessão no provedor: copiar o cookie anterior não permite reutilizá-lo.
- Escrita exige mesma origem e JSON. Corpo limitado a 4096 bytes; erros internos não são expostos.
- Conteúdo autenticado marcado private/no-store. Service worker indisponível neste pacote para evitar cache offline do conteúdo restrito.
- Arquivos internos, caminhos fora da raiz pública/privada e conteúdo de outro aplicativo não são entregues.
- Nenhuma rota cria, estende, aprova ou reativa licenças; nenhuma chave Pix, preço ou dado bancário é necessário.

Conteúdo legitimamente entregue já pode ter sido lido ou copiado. Suspender acesso bloqueia pedidos futuros; não apaga conteúdo que o aluno já recebeu.

## Pendências que bloqueiam publicação

1. Provedor real de identidade/licenças/sessões, armazenamento privado e autorização por titular/aplicativo, em banco isolado de homologação.
2. Fluxo administrativo auditado e transacional que só ative licença após conferência bancária efetiva pelo proprietário.
3. Limitador persistente entre instâncias. O limitador atual é global por processo e serve apenas para testes de homologação; dez tentativas em dez minutos podem bloquear todo o processo. Não usa headers de IP enviados pelo cliente.
4. Adaptador de hospedagem, HTTPS, controles de custo zero e validação de termos comerciais. Não há serviço provisionado nem plano contratado.
5. Origem de homologação nova, sem service worker antigo. Não limpar progresso nem armazenamento do aluno como mecanismo de migração.
6. Testes reais de navegador e backend com dados fictícios e revisão de privacidade para responsáveis, antes da habilitação.

Testes executados: 20 por repositório, cobrindo o núcleo para Young/Travel e a separação dos arquivos reais do pacote. Não houve login, registro de pagamento, emissão de licença ou alteração de banco de produção.
