# Linha de base de métricas

Data de referência: 23/11/2026. A amostra de lançamento das novas métricas é zero. As taxas históricas abaixo não foram obtidas e permanecem sem medição. Dados fictícios de QA não entram na amostra.

| Indicador | Linha de base | Meta |
| --- | --- | --- |
| Primeira aula concluída | Sem medição | Até 5 minutos |
| Aulas iniciadas e concluídas, por aula | Sem medição | Conclusão acima de 60% |
| Retorno no dia 1 | Sem medição | Acompanhar |
| Retorno no dia 7 | Sem medição | Acima de 30% |
| Facilidade após a primeira aula | Sem medição | Média acima de 4,0 de 5 |
| Participantes ativos, abandono, falhas de áudio e login | Sem medição | Acompanhar |

## Critérios de contagem

- Início corresponde à abertura de uma aula escolhida. Contar uma vez por aula e instalação na janela analisada. Conclusão e etapa seguem os critérios pedagógicos atuais do app.
- Medir tempo até a primeira abertura e tempo até a primeira conclusão separadamente, desde a primeira abertura participante do app. Nas sessões de QA, medir manualmente desde a abertura em perfil limpo, em cenário padronizado.
- Ativos são instalações participantes com atividade na janela. Uma instalação pode ser compartilhada e uma pessoa pode usar mais de uma.
- Abandono é a diferença entre instalações que iniciaram e concluíram cada aula. Informar volume e taxa e exibir somente aulas com inícios.
- D1 e D7 são retornos nos respectivos dias de calendário após o primeiro dia de participação; incluir no denominador somente coortes que já atingiram o dia analisado.
- A nota de facilidade é voluntária e o denominador é a quantidade de respostas. Falhas de áudio e login usam contagens, sem incluir mensagens, áudio, texto digitado ou credenciais.
- Indicador com denominador zero fica sem medição.

## Evidência técnica

Registrar em cada comparação a largura, o fluxo, o número de toques, o tempo até abrir a aula e os resultados de Lighthouse e axe. Os testes usam perfis limpos e dados fictícios. A verificação em aparelhos físicos e com alunos é uma etapa separada.

Base de trabalho: `ux/simplificacao-2026-11-v2`.
