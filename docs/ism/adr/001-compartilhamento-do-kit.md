# ADR 001 — compartilhar o kit por cópia sincronizada e versionada

**Status:** ACEITO pelo proprietário ao solicitar “Prossiga”, em 09/11/2026. A adoção continua restrita a branches e previews.

## Contexto

Business e Young constroem frontends estáticos com scripts próprios. Easy mantém frontend estático e runtime Next. Travel constrói um Worker Vinext/Cloudflare e usa Sites/D1. Há 21 grupos de arquivos idênticos entre produtos, mas não há um bundler, runtime, banco ou autenticação comuns.

## Opções

Avaliação arquitetural qualitativa, não uma estimativa de prazo ou custo.

| Opção | Esforço inicial | Risco nesta base | Efeito nos deploys |
|---|---|---|---|
| Monorepo e pacote compartilhado | Alto: mover/reconectar projetos, CI e raízes | Alto: referências relativas, caches, geradores e fronteiras de conteúdo privado | Altera a organização dos projetos Vercel e exige tratar Sites separadamente |
| Pacote versionado em repositório próprio | Médio: empacotamento e distribuição compatíveis com JS clássico e React | Médio: instalação, credenciais de registry, exports e bundling passam a fazer parte dos quatro builds | Mantém projetos, mas adiciona resolução/instalação de pacote em todos |
| Cópia sincronizada por script, com versão e manifest | Menor: arquivos CSS/JS e adaptadores sobre os builds atuais | Menor: diffs explícitos, sem mudança de hosting ou dependência em runtime | Mantém cada raiz de build e cada provedor atuais |

## Decisão proposta

Adotar **cópia sincronizada a partir de uma única fonte canônica versionada**. Propor um repositório técnico dedicado ao kit, independente dos apps, distribuindo releases de arquivos; nenhum repositório foi criado nesta etapa. Não publicar um pacote npm inicialmente e não usar CDN ou download automático em runtime/build.

O sincronizador, executado deliberadamente pelo desenvolvedor, copia uma release fixa para a camada comum de cada app e gera `ism-kit.lock.json` com versão semântica, commit de origem e SHA-256 por arquivo. O PR mostra os arquivos reais. `verify:kit` detecta edições divergentes nas cópias geradas. Adaptadores de produto ficam fora da área gerada.

Atualizações não serão propagadas automaticamente a produção. Cada app pode permanecer em uma versão validada anterior. O kit não inclui identidade, assinatura, progresso remoto, conteúdo Premium ou credenciais.

## Adoção sem reescrita

- JS clássico: CSS e JS compatíveis com os verificadores atuais, usando uma ponte explícita para comandos existentes. Nada de introduzir React no Business/Young.
- Easy: ponte para o frontend estático e adaptadores React somente nas rotas Next adotadas.
- Travel: adaptadores/componentes React, aproveitando as bibliotecas já instaladas; não migrar seu hosting como efeito colateral.
- Conteúdo e URLs permanecem nos locais atuais. Só rotas e componentes revisados consomem a nova versão.

## Consequências e reversão

Aceita-se duplicação física **controlada**, não manutenção manual de quatro versões divergentes. O kit exige manifest e testes de contrato. Uma futura migração para pacote pode ser reavaliada quando houver builds compatíveis; monorepo não é requisito para um design system.

Reversão: reverter o commit de adoção ou restaurar a release anterior do kit e seu lock no branch de preview. Não tocar em dados nem no release de produção. A fonte canônica única e as cópias geradas satisfazem “tokens em um único lugar” como autoria; não significam um único arquivo remoto carregado pelos alunos.
