import test from 'node:test';
import assert from 'node:assert/strict';
import {loginFeedback} from '../client/login-feedback.mjs';

test('offline orienta reconexão sem anunciar envio', () => {
  assert.match(loginFeedback(null, false), /sem conexão/);
});
test('sucesso descreve solicitação sem garantir entrega', () => {
  assert.match(loginFeedback(null), /Solicitação recebida/);
  assert.doesNotMatch(loginFeedback(null), /enviado|entregue/);
});
test('limites orientam espera por status e por código', () => {
  for (const error of [{status:429}, {code:'over_email_send_rate_limit'}, {code:'over_request_rate_limit'}]) {
    assert.match(loginFeedback(error), /Aguarde alguns minutos/);
  }
});
test('falha do serviço oferece contato sem expor diagnóstico interno', () => {
  assert.match(loginFeedback({status:500, message:'sensitive synthetic value'}), /professor/);
  assert.doesNotMatch(loginFeedback({status:500, message:'sensitive synthetic value'}), /sensitive/);
});
test('resposta genérica não revela existência da conta', () => {
  assert.equal(loginFeedback({code:'user_not_found'}), loginFeedback({code:'invalid_credentials'}));
});
