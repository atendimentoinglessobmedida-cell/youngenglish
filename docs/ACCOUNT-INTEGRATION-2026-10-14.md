# Integração da conta Young

Projeto Supabase dedicado: pttmctaxklaotdvnmjqc. Origem e retorno de Auth configurados para https://youngenglish.vercel.app e /index.html. Chave publicável distribuída ao cliente; nenhuma chave secreta usada. Sessão em sessionStorage; dados de assinatura não entram no backup.

Conta do responsável, perfis por apelido, licença consultada no servidor, progresso manual com conflito, consentimento e remoção implementados. Progresso local separado por conta/perfil; troca de perfil não importa o progresso de outro automaticamente. Premium validado no servidor; aulas privadas ficam só em memória e são removidas ao sair. No pacote público: 96 aulas regulares, 14 amostras Basic e 56 resumos sem diálogo, vocabulário ou respostas pagas. As versões antigas e o histórico Git já continham cópias da demonstração: a mudança protege a distribuição atual, não apaga cópias anteriores.

Sessões usadas no teste de navegador são simuladas. O teste percorre a interface, a fábrica real da API e dados fictícios. Não enviou e-mails nem criou contas/licenças reais. SMTP próprio está desativado: envio padrão do Supabase é restrito aos membros da equipe. O usuário informou não possuir SMTP. Configurar serviço de e-mail sem desativar confirmação; não declarar acesso comercial homologado até testar os alunos e a operação administrativa.

Os arquivos originais de autoria foram preservados em server/private/authoring, ignorados no Git, para futura preparação do catálogo privado. O build de produção não usa esse diretório. scripts/protect-course.cjs requer o catálogo privado local e substitui apenas os três arquivos de dados públicos por catálogo/amostras; scripts/build-auth.cjs gera o cliente oficial. As dependências são fixas e o cliente compilado está versionado. A reprodução de testes SQL de catálogo privado requer a cópia local privada; não publicá-la para facilitar CI.

Conferir o acesso externo da hospedagem: Vercel SSO consultado permanece habilitado. A publicação deste código não remove essa proteção. Validar ou autorizar a política da produção separadamente.
