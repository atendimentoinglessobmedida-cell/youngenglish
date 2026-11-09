# Padrão incremental ISM 0.1.0

Aplicativo: young. A estrutura nativa permanece; a camada comum fica em src/ism/{app,features,components,styles,strings,content/schemas,lib,shared}. Conteúdo e regras de acesso continuam no produto. Não editar shared: sincronizar pela fonte canônica versionada.

## Verificação

Execute npm ci, npm run format:check e npm run verify. O comando comum verifica sintaxe, JSON, preservação de materiais por SHA-256, links locais sem novas falhas, testes e build nativos. O snapshot de links ausentes é dívida explícita, não aprovação. Testes nativos validam os formatos reais das aulas; novos dados devem adotar um schema antes da inclusão. A verificação semântica de todo conteúdo legado ainda é incremental. URLs remotas, login real e revisão auditiva exigem avaliação separada. Nenhum novo pacote entra no runtime; Prettier 3.6.2 é somente ferramenta de desenvolvimento, obtida por npx.

## Adicionar aula

Use o catálogo e IDs do produto, preserve o esquema e as permissões existentes, inclua traduções/alternativas e arquivos de mídia com licença; execute os testes nativos e atualize o manifesto de preservação somente após revisão do conteúdo. Não importe catálogo premium do servidor no cliente. Não marque áudio como aprovado sem escuta humana.

## Contribuir e adicionar app

Use branch de preview, commits feat/fix/chore por tema, idioma do código em inglês, rótulos em src/ism/strings. Preserve nomes e rotas existentes. Novo app: criar adapter para o kit, definir tokens de marca, manifest, quatro tabs, três atalhos, recursos e retomada validada; repetir verify e QA em 360/390 px antes de publicar preview. Leia também as regras nativas do repositório.

## Ambientes e observabilidade

Não copiar valores de produção. As variáveis necessárias estão no inventário técnico; os exemplos existentes continuam válidos. O kit não envia telemetria, respostas, identidade ou credenciais. Falhas de build/testes geram saída na CI; erros do backend continuam no logger da plataforma. Coleta remota de erros do navegador não foi habilitada, pois requer endpoint, política de privacidade e aprovação específica.

## Style guide e rollback

Referência: /assets/ism/styleguide.html. Para reverter, descartar a branch/preview ou reverter os commits desta camada em ordem inversa; nenhuma migração de dados foi criada. Publicação de produção é manual após aprovação por aplicativo: confirmar origem/commit, executar verify, testar login e planos no preview, medir Lighthouse/mobile, revisar capturas e conteúdo, então promover o deployment explicitamente identificado. Não promover com falhas ou itens obrigatórios não medidos.
