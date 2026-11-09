# Ambientes — young

Prévia, staging e produção são separados. A camada visual não cria nem copia segredos. As configurações existentes permanecem intactas. Configure somente os valores do ambiente escolhido, com privilégios mínimos.

Nomes confirmados no inventário de código (nenhum valor):

- `YOUNG_SUPABASE_PROJECT_REF`
- `YOUNG_SUPABASE_URL`
- `YOUNG_SUPABASE_PUBLISHABLE_KEY`
- `YOUNG_APP_ORIGIN`

O backend usa o projeto exclusivo Young e proteção por responsável/perfil. Não configurar service-role ou reaproveitar o projeto Business. A proteção Vercel permanece ativa.

O arquivo .env.example é documental; não foi criado .env com valores reais. SMTP, pagamento e acesso hospedado não foram alterados por esta fase.

