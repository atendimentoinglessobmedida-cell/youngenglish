# ISM Exercise Engine — benchmark Test-English, conteúdo original

## Princípio
Usar padrões pedagógicos e mecânicas comuns de plataformas de ensino como referência, sem copiar questões, textos, explicações, áudios, imagens ou banco de dados de terceiros.

## Tipos de exercício v1
1. multiple-choice — uma resposta, feedback imediato após envio.
2. contextual-gap — lacuna em frase/diálogo com opções.
3. text-gap — cloze em texto curto com lacunas independentes.
4. reorder — reconstrução de frase por blocos.
5. matching — expressão ↔ significado/situação.
6. error-correction — localizar e corrigir erro.
7. reading-check — texto + questões de compreensão/inferência.
8. listening-check — áudio/vídeo + questões; transcrição só após envio.
9. use-of-english — sessão mista de gramática/vocabulário.
10. writing-builder — planejamento guiado + produção + checklist/rubrica.
11. speaking-choice — ouvir/ler situação e escolher ou gravar resposta.
12. retry-mistakes — nova rodada somente com itens errados, com variantes.

## Contrato pedagógico por item
- id estável
- skill e CEFR
- prompt original
- options quando aplicável
- answer/rubric
- feedbackCorrect
- feedbackIncorrect explicando o motivo
- hint opcional, sem revelar a resposta
- explanation pós-resposta
- retryVariant opcional
- sourceTag: ism-original

## Fluxo
Responder → confirmar → feedback imediato → explicação curta → próximo.
No fim: score por habilidade + erros → botão “Praticar meus erros”.
Nunca premiar XP apenas por abrir áudio/vídeo.

## Acessibilidade
Teclado completo; foco após feedback; aria-live; não depender apenas de cor; touch target >=44px; reduced-motion.

## Adaptação
### Travel
Imigração, aeroporto, hotel, restaurante, compras, direção, parques, saúde, emergências e retorno. Priorizar diálogos, listening e speaking funcional.

### Business
Meetings, presentations, negotiation, networking, leadership, global teams, email e carreira. Priorizar Use of English contextual, listening profissional, writing e speaking.

### Young English
Distribuir por seis níveis. Sessões curtas, maior variedade visual, reorder/matching/vocabulary/context, leitura, listening e escrita progressiva. Feedback simples e motivador, sem infantilizar níveis avançados.

## Gate
Persistir tentativas e erros sem quebrar chaves atuais. Testar refresh/offline, Android/iOS, teclado, progresso e migração antes de promoção.
