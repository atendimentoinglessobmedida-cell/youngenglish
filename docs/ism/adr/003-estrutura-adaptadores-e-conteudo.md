# ADR 003 — camada comum incremental; caminhos legados preservados

**Status:** ACEITO pelo proprietário ao solicitar “Prossiga”, em 09/11/2026. A adoção continua restrita a branches e previews.

## Contexto

Business usa arquivos de raiz e allowlists; Easy gera JS e possui App Router; Young depende de ordem de scripts e páginas de níveis; Travel possui `app/features`, handlers e bindings Workers. Mover tudo para `src/app` imediatamente quebra contratos, cria ambiguidade de descoberta de rotas e aumenta o risco sem melhorar a experiência do aluno.

## Decisão proposta

Adicionar uma estrutura **comum para a nova camada**, preservando as pastas nativas:

```text
src/ism/
  app/              # composição da interface comum; não substitui o router nativo
  components/       # consumidores e pontes da UI
  styles/           # cópias geradas do kit e aliases
  strings/          # interface em português
  features/         # composição nova por função, sem catálogo privado
  content/schemas/  # contratos; os materiais permanecem em seus locais atuais
  lib/              # adaptadores pequenos e contratos sem dependência de backend
tests/ism/
scripts/ism/
docs/adr/
```

Os quatro apps terão esse mapa complementar e os mesmos nomes de comandos. **Não se promete que os repositórios inteiros ficarão idênticos sem mover código legado.** Exigir identidade literal de todas as pastas é incompatível com a estratégia incremental de menor risco e exigiria outra decisão.

Kebab-case para arquivos/rotas novas, PascalCase para componentes React, namespace `.ism-*` para classes e nomes de código em inglês. Adaptadores conectam comandos já existentes e recebem dados através de contratos explícitos. Reorganizar menus não autoriza reimplementar login, alterar duração de sessão, conceder acesso ou gravar progresso de outra forma.

## Conteúdo e rotas

Não mover nem reescrever materiais para obter uma aparência de uniformidade. Começar com validadores/adaptadores somente de leitura sobre os formatos atuais. Eles devem apontar aula, campo e caminho do asset ausente. Distinguir áudio gravado exigido, gravação pendente e reprodução sintetizada com alternativa por leitura. Validação estrutural nunca equivale a revisão auditiva humana.

Na extração futura de dados embutidos em código, congelar manifest de IDs, texto, ordem e assets antes e comparar depois. Não renumerar currículo nem alterar índices de progresso; não trazer conteúdo Premium do servidor para bundles do kit.

Todas as URLs atuais entram em um inventário com seu destino e estado de acesso. Se houver alias novo, manter o antigo. A cobertura deve incluir URLs de lição, etapas, query/hash, páginas de níveis e recursos complementares. Nenhum redirecionamento hospedado será alterado nesta fase de arquitetura.

## Adoção por app

1. Easy: respeitar `web/` e seus geradores; consumidores Next entram separadamente. Não editar arquivos gerados como única fonte de verdade.
2. Young: preservar perfis, consentimento e o runtime dedicado; substituir entradas de menu somente quando a cobertura comprovar que cada recurso continua alcançável.
3. Business: preservar a ordem do tema final, páginas estáticas, contratos de progresso e conteúdos de servidor.
4. Travel: manter roteamento React/Sites, D1 e a divisão essencial/Premium; não converter a implantação em Next nativo como parte de um ajuste visual.

## Consequências e reversão

Convivência temporária entre legado e camada comum é deliberada. README mostra ambos e identifica arquivos gerados. Cada rota adotada tem commit próprio e pode voltar à implementação anterior sem migração de dados. Excluir o branch de preview só será uma ação de limpeza posterior; nenhum histórico ou trabalho existente foi apagado nesta etapa.
