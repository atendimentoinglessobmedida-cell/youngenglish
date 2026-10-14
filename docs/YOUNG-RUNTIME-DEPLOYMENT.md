# Entrada da API Young — preparação local de 14/10/2026

`api/young.mjs` monta a API Node da Vercel. O rewrite entrega a ação ao adaptador `server/young-runtime.mjs`. Este pacote ainda não foi publicado; não representa acesso comercial ativo.

Antes da ativação, provisionar o projeto dedicado Young na organização Inglês Sob Medida, aplicar as sete migrations preservadas e o seed privado e validar RLS com contas de teste. O projeto do Business é explicitamente rejeitado pelo adaptador.

Variáveis no projeto Vercel Young: `YOUNG_SUPABASE_PROJECT_REF`, `YOUNG_SUPABASE_URL`, `YOUNG_SUPABASE_PUBLISHABLE_KEY` e `YOUNG_APP_ORIGIN`. Usar somente a chave `sb_publishable_`; nenhuma service-role ou senha do banco. A origem deve ser a origem HTTPS canônica do app. Sem configuração íntegra, a API responde 503 e não consulta banco algum.

Após conectar o frontend, homologar cadastro do responsável, conta verificada, perfil, progresso com conflito, consentimento ao professor, licença ativa/expirada e conteúdo Premium antes de habilitar vendas. O conteúdo Premium atual da demonstração pública precisa sair dos arquivos públicos na versão comercial; montar esta API sozinha não conclui essa proteção.

Verificação local acrescentada: quatro testes do adaptador verificam falha fechada, rejeição ao Business/chave secreta, rewrite e autenticação/origem. Estes testes usam fixtures; não representam teste do Supabase remoto nem de cobrança.

Documentação de referência: https://vercel.com/docs/functions/runtimes/node-js
