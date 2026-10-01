/* Fontes oficiais e atividades autorais. O clipe NASA é visual, sem narração. */
const videoMissions=[
 {id:'schoolbag',level:'Elementary',title:'Minha mochila em inglês',sourceTitle:'How to organise your school bag',url:'https://learnenglishkids.britishcouncil.org/how-videos/how-organise-your-school-bag',sourceLevel:'Levels 1 e 2 do LearnEnglish Kids; sem equivalência CEFR indicada',scene:1,goal:'Reconhecer objetos e escrever duas frases com I have.',before:'Procure objetos conhecidos. Você não precisa entender todas as instruções. Pause e observe um item de cada vez.',watch:'Anote dois objetos que reconhecer. Se ouvir uma palavra desconhecida, use o contexto visual e consulte o apoio da fonte.',words:[['bag','mochila'],['book','livro'],['pen','caneta'],['pencil','lápis'],['notebook','caderno'],['have','ter']],support:'My name is Maya. I have a bag. I have a book and a pen. My notebook is blue. I put my pencil in my bag. I am ready for school.',questions:[{prompt:'No texto ISM, qual palavra significa “caderno”?',options:['notebook','pencil','bag'],answer:0,explanation:'Notebook é caderno; pencil é lápis e bag é mochila.'},{prompt:'Qual frase apresenta um objeto que quem fala possui?',options:['I have a pen.','I is a pen.','I pen have.'],answer:0,explanation:'I have + objeto indica o que quem fala tem.'}],grammar:{prompt:'Complete o modelo: I ___ a book.',accepted:['have'],explanation:'Com I, usamos have: I have a book.'},writing:'Escreva duas frases sobre a mochila de um personagem inventado. Use I have e um objeto.',model:'I have a book. I have a blue pen.',criteria:['Usei um personagem inventado, sem dados pessoais.','Escrevi duas frases com apoio do modelo.','Conferi I have, uma palavra da missão e o ponto final.']},
 {id:'objects',level:'Basic',title:'Perto, longe, um ou vários?',sourceTitle:'This, that, these, those',url:'https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar/these-those',sourceLevel:'A1–A2 na fonte; atividade ISM com apoio para Basic',scene:1,goal:'Distinguir singular e plural ao apontar objetos.',before:'Pense em algo perto de você e algo distante. Compare um objeto e vários objetos.',watch:'Observe os exemplos com this, that, these e those. Procure pistas de distância e quantidade.',words:[['this','isto/este/esta'],['that','aquilo/aquele/aquela'],['these','estes/estas'],['those','aqueles/aquelas'],['near','perto'],['far','longe']],support:'A fictional art club is preparing a display. Maya points to one picture near her: This is my picture. Leo points to several cards on his table: These are our cards. One poster is far from them: That is the poster for our club. Several boxes are on a distant shelf: Those are the boxes we need. They choose their words by checking both distance and number.',questions:[{prompt:'Que expressão aponta para vários objetos perto de quem fala?',options:['These are our cards.','That is our card.','This is our card.'],answer:0,explanation:'These é plural e indica proximidade; this é singular.'},{prompt:'Qual palavra do apoio significa “longe”?',options:['far','near','these'],answer:0,explanation:'Far indica distância; near indica proximidade.'}],grammar:{prompt:'Passe para o plural, mantendo os objetos perto: This is a book.',accepted:['These are books.','These are the books.'],explanation:'This passa a these e is passa a are. No plural, não usamos a.'},writing:'Descreva objetos de uma sala fictícia. Use uma frase com this e outra com these.',model:'This is a green notebook. These are our pencils for the art club.',criteria:['Diferenciei um objeto de vários objetos.','Usei this/is e these/are de modo coerente.','Revisei o sentido e a pontuação.']},
 {id:'routine',level:'Pre-Intermediate',title:'Rotinas com frequência',sourceTitle:'Adverbs of frequency',url:'https://learnenglishteens.britishcouncil.org/grammar/a1-a2-grammar/adverbs-frequency',sourceLevel:'A1–A2 na fonte; revisão e expansão para A2',scene:9,goal:'Explicar uma rotina e contrastar hábitos com advérbios.',before:'Separe o que um personagem faz sempre, às vezes e nunca. Observe onde o advérbio aparece.',watch:'Compare a posição do advérbio com um verbo comum e com be. Não é necessário copiar as falas.',words:[['usually','geralmente'],['often','frequentemente'],['sometimes','às vezes'],['never','nunca'],['always','sempre'],['routine','rotina']],support:'Alex usually reads after school, but on Fridays he often meets a fictional book club. He is sometimes tired, so he chooses a short story instead of a long chapter. His friend Nina always brings a notebook because she likes to collect new words. Nina never writes private information in the shared notebook. On weekends, they sometimes compare the stories they enjoyed. Their routines are different, but both find a small moment to practise. A routine can change when a new activity becomes important.',questions:[{prompt:'Qual palavra indica frequência zero?',options:['never','usually','often'],answer:0,explanation:'Never significa nunca. Usually e often indicam hábitos frequentes.'},{prompt:'Qual frase mantém a posição adequada do advérbio com be?',options:['Alex is sometimes tired.','Alex sometimes tired is.','Alex is tired sometimes never.'],answer:0,explanation:'Neste modelo, sometimes vem depois de is.'}],grammar:{prompt:'Insira usually no modelo: I read after school.',accepted:['I usually read after school.','Usually, I read after school.'],explanation:'Usually pode aparecer antes do verbo principal ou no início da frase.'},writing:'Escreva três frases sobre a rotina de um personagem. Use dois advérbios diferentes e um contraste com but.',model:'Nina usually reads after school. She is sometimes tired, but she enjoys short stories. She never shares private details.',criteria:['Usei dois advérbios para descrever frequência.','Conferi a posição com be e com o verbo principal.','Conectei ideias e revisei a mensagem.']},
 {id:'elephants',level:'Intermediate',title:'Natureza: observar e comparar',sourceTitle:'11 things you never knew about elephants',url:'https://learnenglishteens.britishcouncil.org/study-break/video-zone/11-things-you-never-knew-about-elephants',sourceLevel:'B1 indicado na página do recurso',scene:10,goal:'Comparar informações e separar observação de opinião.',before:'Preveja palavras sobre animais, tamanho e comportamento. Anote perguntas que gostaria de responder.',watch:'Escolha uma informação apresentada e uma reação pessoal. Explique a diferença entre uma informação do vídeo e sua opinião.',words:[['observe','observar'],['compare','comparar'],['larger','maior'],['behaviour','comportamento'],['detail','detalhe'],['opinion','opinião']],support:'A fictional wildlife club watches two short clips of animals. In the first clip, an animal walks slowly beside a larger member of its group. In the second, several animals move towards the same place. The students write down what they can observe before discussing possible explanations. One student says the first clip is more interesting. That is an opinion, not a measurement. Another student describes the difference in size. The teacher asks which details are visible and which ideas would need another source. The club learns to compare carefully and to explain the limits of a short clip.',questions:[{prompt:'Qual comentário do texto ISM é uma opinião?',options:['The first clip is more interesting.','Several animals move towards the same place.','One animal is larger than another.'],answer:0,explanation:'More interesting expressa uma avaliação pessoal; os outros comentários descrevem detalhes observados na cena fictícia.'},{prompt:'Qual forma compara o tamanho de dois animais?',options:['One animal is larger than the other.','One animal is largest than the other.','One animal is large than the other.'],answer:0,explanation:'Usamos larger than para uma comparação entre dois elementos.'}],grammar:{prompt:'Complete a comparação: This animal is ___ than the other one. Use large.',accepted:['larger'],explanation:'Large recebe -r: larger. Than introduz o outro elemento da comparação.'},writing:'Escreva um parágrafo sobre uma cena fictícia de animais. Inclua uma comparação, uma observação e uma opinião claramente identificada.',model:'In the fictional clip, one animal is larger than the other. Both move towards the same tree. I think the scene is interesting, but that is my opinion. A longer clip could help us understand their behaviour.',criteria:['Incluí uma comparação clara.','Distingui observação e opinião.','Usei uma razão ou um detalhe e revisei a estrutura.']},
 {id:'accessibility',level:'Upper',title:'Jogos para mais pessoas',sourceTitle:'Just Dance moves to be more accessible',url:'https://learnenglishteens.britishcouncil.org/study-break/video-zone/just-dance-moves-be-more-accessible',sourceLevel:'B1–B2 indicado na página do recurso; discussão ISM para B2',scene:2,goal:'Defender uma melhoria de acesso com razões e limitações.',before:'Pense em instruções, controles e opções de participação. Uma pessoa pode participar de maneiras diferentes.',watch:'Identifique uma mudança mencionada e discuta quem ela pode ajudar. Uma mudança isolada não comprova que todas as necessidades foram atendidas.',words:[['accessible','acessível'],['barrier','barreira'],['option','opção'],['feedback','retorno/avaliação'],['participate','participar'],['limitation','limitação']],support:'A fictional school club has redesigned a movement game after receiving feedback from participants. The new version offers a seated option, clearer written instructions and a way to practise without a score. These changes may reduce some barriers, but the club has not tested the design with every possible user. Some students suggest adjustable timing. Others ask for visual instructions that do not depend only on colour. The team decides to invite further feedback before describing the game as accessible to everyone. They explain what has changed, who has tried it and which limitations remain. A useful proposal combines enthusiasm with a clear account of the evidence. It also recognises that people should be able to choose how they participate.',questions:[{prompt:'Qual afirmação respeita as evidências do texto ISM?',options:['The changes may reduce some barriers, but further feedback is needed.','The club has removed every possible barrier.','Everyone must participate in the same way.'],answer:0,explanation:'A proposta reconhece benefícios possíveis e limites dos testes realizados.'},{prompt:'Que palavra significa um obstáculo à participação?',options:['barrier','option','feedback'],answer:0,explanation:'Barrier é uma barreira. Uma option oferece escolha; feedback é retorno.'}],grammar:{prompt:'Complete: The team ___ redesigned the game. Use o auxiliar do present perfect.',accepted:['has'],explanation:'The team é tratado como singular neste modelo: has + particípio.'},writing:'Proponha uma melhoria para um jogo fictício. Dê uma razão, reconheça uma limitação e sugira como obter feedback.',model:'The club has added a seated option, which may allow more students to participate. However, the design has not been tested with every user. I suggest adjustable timing and a short feedback session before making a broader claim.',criteria:['Defendi uma proposta com uma razão.','Reconheci uma limitação sem presumir necessidades de pessoas reais.','Usei linguagem cuidadosa e revisei conectores e verbos.']},
 {id:'evidence',level:'Advanced',title:'O que um experimento permite concluir?',sourceTitle:'How dirty is your mobile phone?',url:'https://learnenglishteens.britishcouncil.org/study-break/video-zone/how-dirty-your-mobile-phone',sourceLevel:'B2–C1 indicado na página do recurso; análise ISM para C1',scene:7,goal:'Distinguir evidência, inferência e generalização com linguagem precisa.',before:'Observe perguntas, comparações e limites do método. Esta missão trabalha inglês; não propõe experimentos ou recomendações de saúde.',watch:'Anote uma conclusão e identifique que evidência a sustenta. Pergunte se o resultado permite falar sobre todos os casos ou apenas sobre os exemplos observados.',words:[['sample','amostra'],['evidence','evidência'],['inference','inferência'],['claim','afirmação'],['uncertainty','incerteza'],['alternative','alternativa']],support:'A fictional media club compares how two reports describe the same classroom demonstration. The first report makes a broad claim about all objects of a particular type. The second explains that the demonstration used only a small sample and that the conditions were not identical in every case. Neither report provides enough information to establish a general conclusion. One observer suggests that differences in handling may have influenced the result. Another notes that the selection of the sample could also matter. The club distinguishes a visible outcome from an explanation of its cause. It rewrites the headline to describe the examples actually observed, then identifies what further information would be needed. A cautious account does not pretend that every explanation is equally likely. Instead, it states what the evidence supports, what remains uncertain and which alternative interpretations deserve investigation. The students practise this language without performing an experiment or drawing a health recommendation.',questions:[{prompt:'Qual conclusão é compatível com uma amostra pequena e condições diferentes?',options:['The observations may suggest a difference, but they do not establish a general rule.','The demonstration proves that every object behaves in exactly the same way.','Uncertainty means that no observation can be described.'],answer:0,explanation:'May suggest delimita a inferência; uma amostra pequena não estabelece uma regra universal.'},{prompt:'Qual termo descreve uma interpretação que vai além da observação direta?',options:['inference','sample','headline'],answer:0,explanation:'Inference é inferência. Sample é amostra; headline é título de uma notícia.'}],grammar:{prompt:'Torne cautelosa a afirmação com may: The sample suggests a difference.',accepted:['The sample may suggest a difference.'],explanation:'Depois de may, usamos o verbo base suggest. A hipótese permanece delimitada à amostra.'},writing:'Reescreva uma manchete fictícia exagerada sobre uma demonstração escolar. Explique a evidência, uma limitação e uma interpretação alternativa, sem recomendar experimentos.',model:'The classroom observations may suggest a difference within this small sample. However, the conditions were not identical, so the result does not establish a general rule. Differences in handling offer an alternative explanation. A more precise headline should identify the sample and acknowledge what remains uncertain.',criteria:['Delimitei a afirmação à evidência disponível.','Expliquei uma limitação e uma alternativa plausível.','Revisei hedging, coesão e precisão sem fazer recomendação de saúde.']}
];

/* NASA SVS 5039: domínio público conforme https://svs.gsfc.nasa.gov/help/; sem música licenciada. */
videoMissions.push(...[
 {
  "provider": "NASA SVS",
  "sourceTitle": "From the Moon to the Earth",
  "url": "https://svs.gsfc.nasa.gov/5039/",
  "sourceLevel": "Visualização sem narração; atividade ISM adaptada ao nível",
  "scene": 10,
  "mediaUrl": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005039/moon_to_earth_720p30.mp4",
  "mediaDescription": "Uma câmera virtual passa pela superfície cinza e cheia de crateras da Lua e se afasta em direção à Terra iluminada. A Terra apresenta oceanos azuis, continentes e nuvens. É uma visualização, não a gravação de uma viagem feita por estudantes.",
  "credit": "NASA’s Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC).",
  "before": "Leia as seis palavras e o objetivo. O mesmo clipe visual é usado com desafios diferentes em cada nível.",
  "watch": "Observe a mudança de ponto de vista. Pause quando quiser e use o texto ISM para praticar inglês. Este clipe não tem falas; a missão trabalha vocabulário, leitura, gramática e escrita, não compreensão de áudio.",
  "id": "space-elementary",
  "level": "Elementary",
  "title": "Space Lab: palavras e cores",
  "goal": "Nomear a Lua e a Terra e escrever frases com I have.",
  "words": [
   [
    "Moon",
    "Lua"
   ],
   [
    "Earth",
    "Terra"
   ],
   [
    "blue",
    "azul"
   ],
   [
    "grey",
    "cinza"
   ],
   [
    "picture",
    "imagem"
   ],
   [
    "have",
    "ter"
   ]
  ],
  "support": "Maya has a space notebook. I have a picture of the Moon, she says. I have a picture of the Earth too. The Earth looks blue in the picture. The Moon looks grey. Maya draws a blue circle in her notebook.",
  "questions": [
   {
    "prompt": "No texto ISM, o que Maya tem?",
    "options": [
     "Pictures of the Moon and the Earth.",
     "A real spaceship.",
     "A new bicycle."
    ],
    "answer": 0,
    "explanation": "Maya tem imagens em um caderno; a história não descreve uma viagem real."
   },
   {
    "prompt": "Qual modelo usa a ordem adequada?",
    "options": [
     "I have a blue picture.",
     "I blue have a picture.",
     "I has a picture blue."
    ],
    "answer": 0,
    "explanation": "Neste modelo usamos I have + a + adjetivo + substantivo."
   }
  ],
  "grammar": {
   "prompt": "Complete: I ___ a picture of the Moon.",
   "accepted": [
    "have"
   ],
   "explanation": "Com I, usamos have."
  },
  "writing": "Escreva duas frases sobre o caderno espacial de um personagem. Use I have e uma palavra da missão.",
  "model": "I have a Moon picture. I have a blue notebook.",
  "criteria": [
   "Escrevi duas frases sobre uma situação fictícia.",
   "Usei I have e uma palavra da missão.",
   "Conferi maiúsculas e pontos finais."
  ]
 },
 {
  "provider": "NASA SVS",
  "sourceTitle": "From the Moon to the Earth",
  "url": "https://svs.gsfc.nasa.gov/5039/",
  "sourceLevel": "Visualização sem narração; atividade ISM adaptada ao nível",
  "scene": 10,
  "mediaUrl": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005039/moon_to_earth_720p30.mp4",
  "mediaDescription": "Uma câmera virtual passa pela superfície cinza e cheia de crateras da Lua e se afasta em direção à Terra iluminada. A Terra apresenta oceanos azuis, continentes e nuvens. É uma visualização, não a gravação de uma viagem feita por estudantes.",
  "credit": "NASA’s Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC).",
  "before": "Leia as seis palavras e o objetivo. O mesmo clipe visual é usado com desafios diferentes em cada nível.",
  "watch": "Observe a mudança de ponto de vista. Pause quando quiser e use o texto ISM para praticar inglês. Este clipe não tem falas; a missão trabalha vocabulário, leitura, gramática e escrita, não compreensão de áudio.",
  "id": "space-basic",
  "level": "Basic",
  "title": "Space Lab: perto e longe",
  "goal": "Usar this, that, these e those em uma exposição espacial fictícia.",
  "words": [
   [
    "near",
    "perto"
   ],
   [
    "far",
    "longe"
   ],
   [
    "this",
    "este/esta"
   ],
   [
    "those",
    "aqueles/aquelas"
   ],
   [
    "cards",
    "cartões"
   ],
   [
    "poster",
    "pôster"
   ]
  ],
  "support": "Leo creates a fictional space display after watching a visualization. One Moon card is near him: This is my Moon card. One Earth poster is far from him: That is our Earth poster. Several cards are on his table: These are my cards. Several boxes are on a distant shelf: Those are our boxes. Distance and number help him choose the right word.",
  "questions": [
   {
    "prompt": "Qual frase aponta para vários cartões perto de Leo?",
    "options": [
     "These are my cards.",
     "That is my card.",
     "This is my card."
    ],
    "answer": 0,
    "explanation": "These indica plural e proximidade."
   },
   {
    "prompt": "Qual frase indica um pôster distante?",
    "options": [
     "That is our Earth poster.",
     "These are our Earth poster.",
     "Those is our Earth poster."
    ],
    "answer": 0,
    "explanation": "That is indica um objeto distante."
   }
  ],
  "grammar": {
   "prompt": "Passe para o plural, mantendo os objetos perto: This is a card.",
   "accepted": [
    "These are cards.",
    "These are the cards."
   ],
   "explanation": "This/is passa a these/are; retiramos a no plural."
  },
  "writing": "Descreva uma exposição espacial fictícia. Use this em uma frase e those em outra.",
  "model": "This is my Moon card. Those are our blue Earth posters.",
  "criteria": [
   "Diferenciei um objeto de vários.",
   "Combinei this/is e those/are.",
   "Indiquei distância de forma coerente e revisei a pontuação."
  ]
 },
 {
  "provider": "NASA SVS",
  "sourceTitle": "From the Moon to the Earth",
  "url": "https://svs.gsfc.nasa.gov/5039/",
  "sourceLevel": "Visualização sem narração; atividade ISM adaptada ao nível",
  "scene": 10,
  "mediaUrl": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005039/moon_to_earth_720p30.mp4",
  "mediaDescription": "Uma câmera virtual passa pela superfície cinza e cheia de crateras da Lua e se afasta em direção à Terra iluminada. A Terra apresenta oceanos azuis, continentes e nuvens. É uma visualização, não a gravação de uma viagem feita por estudantes.",
  "credit": "NASA’s Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC).",
  "before": "Leia as seis palavras e o objetivo. O mesmo clipe visual é usado com desafios diferentes em cada nível.",
  "watch": "Observe a mudança de ponto de vista. Pause quando quiser e use o texto ISM para praticar inglês. Este clipe não tem falas; a missão trabalha vocabulário, leitura, gramática e escrita, não compreensão de áudio.",
  "id": "space-pre-intermediate",
  "level": "Pre-Intermediate",
  "title": "Space Lab: rotina de observação",
  "goal": "Descrever hábitos de um clube de ciências com advérbios de frequência.",
  "words": [
   [
    "usually",
    "geralmente"
   ],
   [
    "sometimes",
    "às vezes"
   ],
   [
    "often",
    "frequentemente"
   ],
   [
    "never",
    "nunca"
   ],
   [
    "notes",
    "anotações"
   ],
   [
    "club",
    "clube"
   ]
  ],
  "support": "Nina usually reads about space after school. Her fictional science club often watches short visualizations and writes notes in English. Nina is sometimes unsure about a new word, so she checks its meaning. The club never describes an animation as a real trip taken by its members. They sometimes compare their drawings with the visualization. Their routine helps them practise a little at a time.",
  "questions": [
   {
    "prompt": "Qual hábito aparece no texto ISM?",
    "options": [
     "The club often watches visualizations.",
     "The club always travels to the Moon.",
     "Nina never reads about space."
    ],
    "answer": 0,
    "explanation": "A história descreve assistir e fazer anotações, não uma viagem real."
   },
   {
    "prompt": "Qual frase usa a posição comum do advérbio com be?",
    "options": [
     "Nina is sometimes unsure.",
     "Nina sometimes unsure is.",
     "Nina is unsure often never."
    ],
    "answer": 0,
    "explanation": "Neste modelo, sometimes aparece depois de is."
   }
  ],
  "grammar": {
   "prompt": "Insira usually: I read about space after school.",
   "accepted": [
    "I usually read about space after school.",
    "Usually, I read about space after school."
   ],
   "explanation": "Usually pode ficar antes do verbo principal ou no começo da frase."
  },
  "writing": "Escreva três frases sobre a rotina de um clube fictício. Use dois advérbios diferentes e um contraste com but.",
  "model": "Our club usually watches short clips. We are sometimes unsure, but we check new words. We never invent evidence.",
  "criteria": [
   "Usei dois advérbios de frequência.",
   "Conferi a posição dos advérbios.",
   "Conectei ideias com but e revisei as frases."
  ]
 },
 {
  "provider": "NASA SVS",
  "sourceTitle": "From the Moon to the Earth",
  "url": "https://svs.gsfc.nasa.gov/5039/",
  "sourceLevel": "Visualização sem narração; atividade ISM adaptada ao nível",
  "scene": 10,
  "mediaUrl": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005039/moon_to_earth_720p30.mp4",
  "mediaDescription": "Uma câmera virtual passa pela superfície cinza e cheia de crateras da Lua e se afasta em direção à Terra iluminada. A Terra apresenta oceanos azuis, continentes e nuvens. É uma visualização, não a gravação de uma viagem feita por estudantes.",
  "credit": "NASA’s Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC).",
  "before": "Leia as seis palavras e o objetivo. O mesmo clipe visual é usado com desafios diferentes em cada nível.",
  "watch": "Observe a mudança de ponto de vista. Pause quando quiser e use o texto ISM para praticar inglês. Este clipe não tem falas; a missão trabalha vocabulário, leitura, gramática e escrita, não compreensão de áudio.",
  "id": "space-intermediate",
  "level": "Intermediate",
  "title": "Space Lab: observar e comparar",
  "goal": "Comparar duas imagens e distinguir aparência de tamanho real.",
  "words": [
   [
    "compare",
    "comparar"
   ],
   [
    "view",
    "vista"
   ],
   [
    "closer",
    "mais perto"
   ],
   [
    "larger",
    "maior"
   ],
   [
    "surface",
    "superfície"
   ],
   [
    "appear",
    "parecer"
   ]
  ],
  "support": "A fictional science club pauses the visualization twice. In the first view, the Moon fills much of the screen. Later, the Earth becomes visible as the virtual camera moves. The club can compare the two views, but it must be careful. An object can appear larger on screen because the viewpoint is closer. A screen image alone does not establish its real size. The members describe visible colours and shapes before making a comparison.",
  "questions": [
   {
    "prompt": "Por que um objeto pode parecer maior na tela?",
    "options": [
     "The viewpoint may be closer.",
     "Screen size always proves real size.",
     "Every large image is a large planet."
    ],
    "answer": 0,
    "explanation": "Perspectiva pode alterar a aparência; tamanho na tela não estabelece tamanho real."
   },
   {
    "prompt": "Qual frase usa can corretamente?",
    "options": [
     "We can compare the views.",
     "We can compares the views.",
     "We can comparing the views."
    ],
    "answer": 0,
    "explanation": "Can é seguido do verbo base compare."
   }
  ],
  "grammar": {
   "prompt": "Corrija: The club can compares the pictures.",
   "accepted": [
    "The club can compare the pictures."
   ],
   "explanation": "Depois de can, usamos compare, sem -s."
  },
  "writing": "Escreva 40 palavras ou mais comparando duas vistas de uma animação. Use can e explique um limite da comparação. Pode usar a situação fictícia do texto.",
  "model": "We can compare two views in the animation. The Moon appears larger in the first view because the virtual camera is closer. This does not prove its real size. Our fictional club describes the colours and shapes before drawing a conclusion.",
  "criteria": [
   "Descrevi duas vistas ou características.",
   "Usei can com o verbo base.",
   "Distingui aparência na tela de tamanho real."
  ]
 },
 {
  "provider": "NASA SVS",
  "sourceTitle": "From the Moon to the Earth",
  "url": "https://svs.gsfc.nasa.gov/5039/",
  "sourceLevel": "Visualização sem narração; atividade ISM adaptada ao nível",
  "scene": 10,
  "mediaUrl": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005039/moon_to_earth_720p30.mp4",
  "mediaDescription": "Uma câmera virtual passa pela superfície cinza e cheia de crateras da Lua e se afasta em direção à Terra iluminada. A Terra apresenta oceanos azuis, continentes e nuvens. É uma visualização, não a gravação de uma viagem feita por estudantes.",
  "credit": "NASA’s Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC).",
  "before": "Leia as seis palavras e o objetivo. O mesmo clipe visual é usado com desafios diferentes em cada nível.",
  "watch": "Observe a mudança de ponto de vista. Pause quando quiser e use o texto ISM para praticar inglês. Este clipe não tem falas; a missão trabalha vocabulário, leitura, gramática e escrita, não compreensão de áudio.",
  "id": "space-upper",
  "level": "Upper",
  "title": "Space Lab: melhorar uma explicação",
  "goal": "Relatar uma melhoria com present perfect e sugerir uma mudança.",
  "words": [
   [
    "labels",
    "legendas de identificação"
   ],
   [
    "feedback",
    "retorno/opiniões"
   ],
   [
    "clearer",
    "mais claro"
   ],
   [
    "option",
    "opção"
   ],
   [
    "explanation",
    "explicação"
   ],
   [
    "accessible",
    "acessível"
   ]
  ],
  "support": "A fictional club has prepared a short explanation to accompany a space visualization. The team has added labels to its own drawings and has collected feedback from classmates. These changes may make the explanation clearer, but the team has not tested every part yet. One reader asks for larger text. Another asks whether the animation represents a virtual viewpoint. The club could add a brief description and test its page with a keyboard. A useful improvement should respond to a specific need rather than promise that every barrier has disappeared.",
  "questions": [
   {
    "prompt": "Qual mudança o clube realizou no texto ISM?",
    "options": [
     "It has added labels to its drawings.",
     "It has changed the real Moon.",
     "It has tested every possible barrier."
    ],
    "answer": 0,
    "explanation": "O clube acrescentou identificação aos próprios desenhos; o texto reconhece limites."
   },
   {
    "prompt": "Qual sugestão está bem formada?",
    "options": [
     "The club could add a description.",
     "The club could adds a description.",
     "The club could adding a description."
    ],
    "answer": 0,
    "explanation": "Depois de could, usamos o verbo base add."
   }
  ],
  "grammar": {
   "prompt": "Complete com o present perfect de add: The team ___ labels.",
   "accepted": [
    "has added"
   ],
   "explanation": "The team é singular neste modelo: has + particípio added."
  },
  "writing": "Escreva 60 palavras ou mais sobre uma explicação espacial fictícia. Relate uma melhoria, explique um benefício possível e sugira o próximo passo.",
  "model": "Our team has added labels to its own drawings. This may make the explanation clearer for some readers. However, we still need feedback from different classmates. The club could add a description of the virtual viewpoint and make the text adjustable. We should test those changes before claiming that the explanation is easier for everyone to use.",
  "criteria": [
   "Usei present perfect para uma mudança com efeito atual.",
   "Expliquei um benefício sem prometer resultado para todos.",
   "Sugeri uma melhoria concreta com could."
  ]
 },
 {
  "provider": "NASA SVS",
  "sourceTitle": "From the Moon to the Earth",
  "url": "https://svs.gsfc.nasa.gov/5039/",
  "sourceLevel": "Visualização sem narração; atividade ISM adaptada ao nível",
  "scene": 10,
  "mediaUrl": "https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005039/moon_to_earth_720p30.mp4",
  "mediaDescription": "Uma câmera virtual passa pela superfície cinza e cheia de crateras da Lua e se afasta em direção à Terra iluminada. A Terra apresenta oceanos azuis, continentes e nuvens. É uma visualização, não a gravação de uma viagem feita por estudantes.",
  "credit": "NASA’s Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC).",
  "before": "Leia as seis palavras e o objetivo. O mesmo clipe visual é usado com desafios diferentes em cada nível.",
  "watch": "Observe a mudança de ponto de vista. Pause quando quiser e use o texto ISM para praticar inglês. Este clipe não tem falas; a missão trabalha vocabulário, leitura, gramática e escrita, não compreensão de áudio.",
  "id": "space-advanced",
  "level": "Advanced",
  "title": "Space Lab: perspectiva e evidência",
  "goal": "Avaliar uma afirmação visual e formular uma conclusão com limites.",
  "words": [
   [
    "evidence",
    "evidência"
   ],
   [
    "claim",
    "afirmação"
   ],
   [
    "viewpoint",
    "ponto de vista"
   ],
   [
    "influenced",
    "influenciado"
   ],
   [
    "uncertainty",
    "incerteza"
   ],
   [
    "representation",
    "representação"
   ]
  ],
  "support": "A fictional reviewer watches a visualization and claims that the object occupying more of the screen must be physically larger. Another reviewer challenges that inference. The virtual viewpoint may have influenced the apparent size, and a rendered scene does not provide a measurement by itself. Although the visualization can illustrate a journey between viewpoints, viewers should distinguish its presentation from the evidence required for a size comparison. A stronger explanation would identify the relevant measurements, describe the representation and acknowledge what cannot be inferred from a single frame. The reviewers decide to revise their headline before sharing it with their fictional club.",
  "questions": [
   {
    "prompt": "Qual é o limite identificado no texto ISM?",
    "options": [
     "Apparent screen size alone does not establish physical size.",
     "Every visualization is false.",
     "One frame measures every distance."
    ],
    "answer": 0,
    "explanation": "A crítica trata da inferência específica, não afirma que toda visualização seja falsa."
   },
   {
    "prompt": "Qual frase apresenta uma hipótese sobre o passado?",
    "options": [
     "The viewpoint may have influenced the appearance.",
     "The viewpoint may has influenced the appearance.",
     "The viewpoint may have influence the appearance."
    ],
    "answer": 0,
    "explanation": "May have + particípio influenced expressa uma explicação possível sobre o passado."
   }
  ],
  "grammar": {
   "prompt": "Complete: The viewpoint may have ___ the result. Use influence.",
   "accepted": [
    "influenced"
   ],
   "explanation": "Depois de may have, usamos o particípio influenced."
  },
  "writing": "Escreva 90 palavras ou mais avaliando a afirmação “The larger image proves the object is physically larger”. Distinga evidência e hipótese, apresente um limite e proponha uma comparação melhor.",
  "model": "The larger image does not establish physical size by itself. Although the visualization shows the objects clearly, the virtual viewpoint may have influenced their apparent scale. A stronger comparison would use relevant measurements and explain how the scene was represented. Viewers should separate a useful visual illustration from a conclusion that requires additional evidence. Our fictional club could revise the headline to describe what appears on screen and then identify the information needed to compare real sizes. This would preserve the value of the visualization while making the uncertainty explicit and avoiding an unsupported general claim.",
  "criteria": [
   "Separei observação, hipótese e conclusão.",
   "Expliquei o limite da comparação visual.",
   "Usei linguagem de cautela e propus evidência adicional."
  ]
 }
]);
