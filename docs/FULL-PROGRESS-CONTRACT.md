# Young: progresso completo preparado localmente

Status: validado em banco local, ainda não integrado ao Supabase real nem publicado como serviço de conta.

O formato de nuvem2 contém `done`, `drafts` e `study`. Study preserva XP, respostas, estrelas, vitórias nos17 tipos de jogos presentes no código, conquistas temáticas, modo de missão, faixa kids/teens e aula/etapa de retomada. Textos de vídeos e projetos também são aceitos. Filtros visuais permanecem no aparelho; identidade, sessão, licença e permissões não integram o progresso.

`snapshotToCloud()` converte o snapshot local4. `cloudToSnapshot()` restaura o formato completo e mantém filtros e versão do aplicativo. Registros antigos1 continuam aceitos; como não contêm XP/jogos, a conversão preserva esses dados locais e textos adicionais, evitando apagamento silencioso.

Migrações novas6 e7 acrescentam8695 chaves de atividades do catálogo e validação SQL do formato completo. Não mudam as cinco migrações anteriores. RPC continua exigindo responsável verificado, perfil próprio, revisão atual e consentimento explícito. Valores, IDs e campos inesperados são recusados; erros não alteram o registro. A exclusão continua deixando apenas marcador vazio de revisão para bloquear upload antigo.

56 testes passaram:13 em PostgreSQL18.3 local via PGlite, quatro do codec e demais testes de API, política, backup, áudio, pedagogia e offline. Sete migrações passaram na análise SQL/PLpgSQL. Auth é simulado nos testes; concorrência real entre conexões e configuração Supabase ainda não homologadas.

Executar preparação: `node scripts/prepare-young-backend.cjs` e `node scripts/prepare-progress-keys.cjs`. Executar teste: `node --test tests/progress-codec.test.mjs tests/young-db.test.mjs tests/young-http.test.mjs`. Depois de migrações aplicadas, novas mudanças de catálogo devem gerar migrações adicionais, sem reescrever o histórico.

Antes de ativar: projeto Young dedicado; sete migrações; seed privado separado; login verificado; adaptar envio/carregamento opcional ao codec; testar dois aparelhos e conflito; retirar conteúdo pago do build público; confirmar período e expiração no backend real. Business permanece separado.

Referências verificadas: [segurança da Data API](https://supabase.com/docs/guides/api/securing-your-api), [mudança de grants explícitos](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically). As migrações mantêm grants e RLS explícitos.
