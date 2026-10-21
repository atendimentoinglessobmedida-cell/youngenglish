# Miniaulas ISM Young English

Três episódios introdutórios originais, com versões em inglês e em português. Não incluem conteúdo do catálogo protegido. Cada episódio contém objetivo, seis expressões com exemplos, gramática e pronúncia, diálogo de doze falas, três respostas guiadas e resumo.

Vozes neurais Kokoro v1.0: pf_dora (português), af_heart (inglês e primeiro personagem), am_michael (segundo personagem). A voz de cada personagem permanece estável. Os arquivos MP3 são gerados localmente, sem serviço pago ou credenciais de alunos.

Use Python 3.12 com kokoro-onnx 0.6.1, misaki 0.9.4, soundfile 0.14.0 e espeakng-loader 0.2.4. Baixe kokoro-v1.0.onnx e voices-v1.0.bin do release oficial model-files-v1.1 em https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1. O modelo usa Apache-2.0; o runtime ONNX usa MIT.

A partir da raiz do projeto:

1. Execute node scripts/podcasts/prepare.cjs C:/audio-build.
2. Execute python scripts/podcasts/render.py C:/audio-build C:/kokoro-models.
3. Execute python scripts/podcasts/package.py C:/audio-build/young public C:/tools/ffmpeg.exe.
4. Execute node scripts/podcasts/check.cjs.

Ajuste os caminhos absolutos às suas ferramentas locais. O cache inclui voz, texto, idioma, velocidade e revisão do motor. A montagem recalcula capítulos, duração e hashes. O player usa URLs com versão, não inicia sozinho e interrompe o áudio anterior ao mudar idioma, episódio ou sair da página. Não modifica progresso, conta, licença ou pagamento.

A validação automática cobre arquivos, estrutura, pausas, vozes e tempos. A avaliação de naturalidade e pronúncia exige escuta pedagógica humana. Os novos MP3s não são pré-carregados pelo service worker.
