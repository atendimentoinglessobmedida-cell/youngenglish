# Áudio de diálogos — 8 de outubro de 2026

Dois perfis de voz inglesa, estáveis por personagem, com pausa de 320 ms entre falas e variação moderada de ritmo e pitch. Não há escolha de gênero baseada no nome. Nomes e papéis aparecem na transcrição, mas não são lidos. Um único sintetizador ou arquivo toca por vez. Não há reprodução automática nem gravação ou novo envio de voz do aluno.

Com apenas uma voz inglesa, o app avisa que há uma voz com pequenas variações, sem prometer duas vozes reais. Sem voz inglesa, a transcrição continua disponível. As vozes carregadas posteriormente são aguardadas por até 900 ms. Mudança de atividade, ocultação da página e controles de parar cancelam a reprodução pendente.

Ao trocar de atividade ou conta, o histórico e a transcrição do player são apagados. Parar na mesma atividade mantém a transcrição para repetir. O conteúdo não é persistido pelo player, e não pode ser repetido depois de limpar o contexto.

## Contrato para gravações expressivas futuras

Cada fala aceita `{speaker, text, voiceSlot: 0 | 1, audioUrl?: string}`. `voiceSlot` mantém o perfil em falas individuais e repetidas; não se alterna a cada frase. Quando omitido, a primeira ocorrência do personagem determina seu perfil. Transcrições antigas com `Nome: fala` são convertidas em segmentos sem alterar o conteúdo.

`audioUrl` precisa pertencer à mesma origem do aplicativo e apontar para um arquivo já autorizado. O player usa a gravação quando disponível e retorna à síntese se a reprodução falhar. URLs externas são ignoradas. Não colocar conteúdo, URLs temporárias ou tokens Premium em catálogo público, localStorage ou cache de service worker. Para gravações Premium, usar uma rota que valide o acesso antes de entregar o arquivo; essa rota e as gravações não foram criadas nesta entrega.

Business: `window.ISMAudio.speakDialogue(segmentos, {rate:.95})`; diálogos com personagens encontrados em chamadas existentes de `speak` passam pelo novo player automaticamente, mantendo restrições regionais existentes.

Teens: `window.ISMYoungAudio.speakDialogue(segmentos, {from:0,single:false})`; histórias e atividades de compreensão mantêm a transcrição recolhida até ação do aluno.

Travel: `speakDialogue(segmentos)` em `app/components/audio-system.tsx`; Regular usa os papéis existentes de atendente/viajante, Premium usa os papéis definidos nos workshops. O catálogo continua protegido no servidor.

## Validação e limites

Testes simulam duas/uma/nenhuma voz inglesa, repetição, falas consecutivas do mesmo personagem, seleção individual, cancelamento durante carregamento, erro de arquivo e isolamento de origem. Isso confirma comportamento, não qualidade sonora percebida. Escuta humana em Android/iPhone e avaliação de entonação, naturalidade, volume e adequação pedagógica permanecem necessárias. Nenhum serviço pago foi contratado nem novas gravações expressivas foram geradas.
