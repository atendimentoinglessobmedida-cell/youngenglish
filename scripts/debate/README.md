# ISM Conversation & Debate — piloto

Nove aulas originais em Business, Young e Easy, uma B1, uma B2 e uma C1 por aplicativo. Cada aula contém oito etapas, oito itens recuperados, seis novos itens, quatro expressões de interação, três exercícios de gramática, catorze falas, seis perguntas com aprofundamento e tarefa com dois papéis. Há guia do professor e autorreflexão sem nota automática.

## Operação

Abra debate.html em cada aplicativo. A preparação individual leva cerca de 10–15 minutos; a discussão é planejada para 45–60 minutos com professor ou colega. As aulas não são uma chamada ao vivo nem um interlocutor de IA. O nível orienta a dificuldade; não presume que o aluno dominou todo o material anterior.

Business e Young usam o modelo público das práticas regulares existentes. No Easy, apenas os títulos, objetivos e imagens são públicos; texto integral e áudio exigem o mesmo acesso autorizado do curso. A revisão e liberação das gravações das 72 aulas originais não foi alterada. Os novos diálogos do piloto usam áudio neural sintético com proveniência e sem declaração de revisão auditiva humana.

As anotações de Business e Young só são salvas após escolha explícita e são separadas por app e aula. No Easy permanecem apenas na sessão da página. Nenhuma dessas atividades modifica o progresso principal ou concede licença. Não há gravação de microfone, upload de voz ou pontuação automática de pronúncia.

## Fontes e edição

O conteúdo original fica em scripts/debate/content.cjs no respectivo projeto. A interface usa debate.js, debate-model.js e debate.css. Os arquivos de áudio têm transcrição, personagem, voz e SHA-256 registrados em scripts/debate/media.json. As imagens locais ficam em assets/debate, ou public/assets/debate no Young e web/assets/debate no Easy.

O pacote de autoria desta entrega preserva os três catálogos e o instalador em work/conversation-debate-package. Execute node install.cjs a partir desse pacote para sincronizar os arquivos gerados nas três cópias de publicação. prepare-audio.cjs gera os trabalhos locais; o renderer Kokoro já existente gera WAV; package-audio.cjs codifica os arquivos e mantém o áudio Easy em JSON privado. Modelos e ferramentas de áudio não são enviados aos sites.

## Verificação

Execute node --test scripts/debate.test.cjs em cada projeto. No Easy execute também node --test debate-access.test.cjs. A entrega deve passar pelas verificações existentes de cada aplicativo e pelo build antes de publicar.

As imagens foram geradas pela ferramenta integrada image_gen, uma chamada por imagem, e convertidas para WebP. O manifesto com prompts e origens está em outputs/conversation-debate-image-prompts-20261028.json no workspace. O áudio foi sintetizado localmente com Kokoro v1.0, usando o pipeline e licenças documentados no projeto Business. Revisão auditiva pelo professor e teste físico Android/iPhone continuam necessários antes de tratar a qualidade como validada pedagogicamente.
