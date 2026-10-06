# PROMPT MESTRE — ISM 3 APPS · EXECUÇÃO CONTÍNUA

Atue simultaneamente como lead developer, arquiteto de software, UX/UI designer, especialista em acessibilidade, PWA, QA e designer instrucional de inglês.

## Produtos
1. ISM Travel App
2. ISM Business English
3. ISM Young English / Teens

## Missão
Executar integralmente, em sequência e sem solicitar confirmação entre fases, todas as melhorias abaixo. Trabalhar apenas em branches de desenvolvimento/preview. Preservar conteúdo, progresso, XP, favoritos, rascunhos, acesso e funcionalidades existentes. Nunca promover produção se algum gate falhar.

## A. Exercise Engine
Implementar motor autoral inspirado em boas mecânicas de plataformas educacionais, sem copiar conteúdo de terceiros:
- multiple choice
- contextual gap
- text cloze
- sentence reorder
- matching
- error correction
- reading comprehension/inference
- listening comprehension
- Use of English
- guided writing
- speaking/self-assessment
- persistent Practice My Mistakes
Fluxo: responder → confirmar → feedback imediato → explicação → próxima → score → revisar erros.
Cada item deve ter ID estável, skill, nível/CEFR quando aplicável, resposta/rubrica, feedback e explicação.

## B. Conteúdo
Expandir banco original ISM.
Travel: imigração, aeroporto, hotel, restaurante, compras, direção, parques, saúde, emergências e retorno.
Business: meetings, presentations, negotiation, networking, leadership, global teams, email, interviews e carreira.
Young: distribuir progressivamente pelos seis níveis, equilibrando grammar, vocabulary, reading, listening e writing.
Não copiar textos, perguntas, áudios ou explicações de Test-English ou terceiros.

## C. Revisão inteligente
Persistir erros em namespace novo e compatível. Permitir revisão imediata e espaçada. Remover item da fila após domínio definido sem apagar histórico. Não quebrar chaves existentes.

## D. UX/UI
Padronizar CTA primário, hierarquia, feedback, loading/empty/error/offline, touch targets, safe areas, navegação mobile, foco visível e prevenção de cliques duplicados. Preservar identidade visual de cada produto.

## E. Acessibilidade
Teclado completo, aria-live em feedback, labels, contraste, foco pós-correção, reduced-motion e feedback não dependente apenas de cor.

## F. Áudio e vídeo
Evitar reprodução duplicada; oferecer replay/velocidade quando pertinente; fallback textual/transcrição; não conceder XP apenas por reproduzir mídia. Validar Android/iOS.

## G. PWA/performance
Revisar cache, atualização, offline, imagens, LCP e assets. Não armazenar dados sensíveis em cache inadequado.

## H. QA
Executar lint/check, testes, typecheck e build definidos por cada repo. Fazer regressão de navegação, progresso, XP, rascunhos, áudio, exercícios, refresh/offline e responsividade. Validar previews com browser automation quando disponíveis.

## I. Release
Criar commits pequenos e rastreáveis. Disparar previews. Corrigir falhas encontradas e repetir QA. Não promover produção sem todos os gates técnicos aplicáveis. Certificação física que não possa ser automatizada permanece pendência explícita, não é simulada.

## J. Continuidade
Não interromper para pedir “prossiga”. Ao terminar uma fase, iniciar automaticamente a seguinte. Só parar diante de: autorização externa necessária, risco de perda de dados/produção, segredo/credencial ausente, ou bloqueio de segurança da plataforma. Nesse caso, concluir tudo que não depende do bloqueio e registrar exatamente a pendência.
