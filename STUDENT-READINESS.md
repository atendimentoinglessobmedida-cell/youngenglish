# Preparação para uso dos alunos — 08/10/2026

App: https://youngenglish.vercel.app/

Página de instalação preparada neste ciclo: `/install.html` (disponível no endereço público após publicar esta alteração).

## Alterações

- Salvamento opcional acessível nas telas regulares e Premium. Preserva rascunhos e o progresso no navegador, sem ativar coleta ou sincronização entre aparelhos.
- Desativar salvamento remove o registro persistido; a sessão atual pode continuar.
- Páginas não visitadas mostram recuperação offline; scripts e imagens ausentes nunca recebem HTML da página inicial.
- Atualização limpa somente caches do Young English.
- Instalação funciona sem depender de uma espera indefinida do service worker; o app instalado também registra atualizações.
- Ajuda de instalação fecha por Escape e devolve o foco ao botão.

## Verificação

Build e referências locais aprovados; cinco testes offline aprovados. Chrome local confirma rascunho após recarregar, remoção do registro, retomada offline, ajuda por teclado e ausência de overflow da Home em 320, 390 e 768 px.

O catálogo Premium continua em demonstração. Cobrança e autorização comercial no servidor não foram implementadas neste ciclo. Instalação física e reconhecimento de voz real ainda precisam de homologação.
