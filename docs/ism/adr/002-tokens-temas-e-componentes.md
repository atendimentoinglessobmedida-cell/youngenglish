# ADR 002 — tokens semânticos e adoção visual por componente

**Status:** ACEITO pelo proprietário ao solicitar “Prossiga”, em 09/11/2026. A adoção continua restrita a branches e previews.

## Contexto

As quatro bases têm variáveis e cascatas diferentes. Business força light no tema final; Travel possui escala de espaços/raios e tema próprio; Easy e Young usam CSS global e estilos de recursos. Um reset global imediato altera telas fora do escopo. O teste de ordem do CSS Business já demonstrou essa sensibilidade no protótipo local.

## Decisão proposta

Fonte canônica de tokens semânticos: cores de marca, superfícies, texto, bordas, foco e estados; família e escala tipográfica; pesos e alturas de linha; espaçamento de base 4 px; raios; sombras; toque mínimo; movimento; camadas e safe-area.

Separar `tokens/base`, `tokens/themes` e `tokens/compatibility`. Business mantém azul; Easy mantém roxo; as marcas Travel e Young são extraídas das folhas atuais e revisadas como temas próprios. Não escolher novas cores por suposição.

Primeiro aplicar **aliases para os valores existentes**, sem mover componentes nem alterar layout. Comparar capturas antes/depois. Só depois adotar componentes sob um namespace como `.ism-*`, evitando seletores globais sobre todos os `main`, `button`, `header` ou parágrafos legados. Os protótipos locais anteriores não serão aceitos automaticamente como esse contrato.

O tema claro/escuro seguirá a preferência do sistema até existir escolha explícita do usuário. A preferência existente não será apagada. Cada par semântico e estado deve ter contraste verificado; modo escuro não será declarado AA apenas porque inverte cores. Tamanhos mínimos de interface serão conferidos no DOM em 360/390 px, além dos testes de foco e movimento reduzido.

## Componentes e consumo

| Família | Contrato proposto |
|---|---|
| Botão, atalho, cartão e chip | Estados padrão, foco, hover, desativado e carregando; ação/rota reais |
| Cabeçalho, perfil e barra inferior | Mesma ordem e estrutura; quatro abas; cor e nome por tema |
| Campo, aviso, vazio, erro e skeleton | Rótulo programático, erro associado e anúncio apropriado de estado |
| Modal | Reutilizar primitivas existentes no React; diálogo nativo no estático quando suportado e verificado; foco e retorno documentados |
| Progresso e exercício | Apresentação comum sobre dados e regras originais; sem recalcular autorização ou conclusões |
| Player de áudio | Casca visual sobre o controlador atual; sem declarar qualidade auditiva aprovada |

Usar um subconjunto SVG de um único conjunto de ícones, preferencialmente Lucide já presente no Travel. Fixar versão e licença na release do kit e distribuir apenas os símbolos usados; não instalar uma biblioteca de UI pesada nos estáticos. Pictogramas que fazem parte do conteúdo pedagógico não são substituídos por essa decisão.

Não reprocessar imagens existentes nesta etapa. Manter seus caminhos, dimensões, créditos e carregamento; otimizações futuras precisam de comparação e preservação de conteúdo.

## Strings e referência

Strings do kit centralizadas em `strings/pt-BR`; nomes técnicos do código em inglês. Glossário inicial: **Início, Aulas, Praticar, Progresso, Perfil e configurações, Continuar, Começar primeira aula, Ver em português, Revisão, Situações, Conversação, Instalar**. Texto pedagógico continua no catálogo do produto.

O style guide será uma rota interna de preview, com estados de cada componente, tabela de tokens, variantes de marca e claro/escuro. É uma entrega posterior, ainda não implementada/publicada. Aprovação exige capturas e testes reais; não se utiliza o protótipo como prova de AA.

## Reversão

Um commit para aliases/tokens, outros para cada família/rota adotada. Reverter o consumidor de uma rota não deve exigir reverter outras nem atualizar service worker, banco ou sessão.
