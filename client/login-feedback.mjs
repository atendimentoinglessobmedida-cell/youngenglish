// Não revela existência de conta, credenciais nem mensagens brutas do provedor.
export function loginFeedback(error, online = true) {
  if (!online) return 'Você está sem conexão. Conecte-se à internet para solicitar o link.';
  if (!error) return 'Solicitação recebida. Confira a caixa de entrada e o spam. Se o e-mail não chegar, aguarde antes de solicitar novamente.';
  if (error.status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error.code)) {
    return 'Muitas solicitações de acesso. Aguarde alguns minutos antes de tentar novamente.';
  }
  if (error.status >= 500 || error.code === 'unexpected_failure') {
    return 'O serviço de acesso está indisponível. Tente mais tarde ou entre em contato com o professor.';
  }
  return 'Não foi possível solicitar o link. Confira o endereço informado e tente novamente mais tarde.';
}
