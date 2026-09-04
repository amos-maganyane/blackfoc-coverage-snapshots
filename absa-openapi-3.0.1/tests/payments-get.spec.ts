import { expect, test } from '@playwright/test';
import { authHeaders, headersWithInvalidToken, headersWithoutAuth } from './helpers/auth';
import {
  createPayment,
  getDataString,
  parseJsonRecord,
  preExistingPaymentIdOrSkip,
  readOnlyTokenOrSkip,
} from './helpers/api-helpers';
import { validateSchema } from './helpers/schema-validator';

test.describe('GET /domestic-payments/{domesticPaymentId}', () => {
  test('[DP-12] @smoke Given newly created payment, when retrieved by DomesticPaymentId, then returns 200 with matching payment data', async ({ request }) => {
    const { domesticPaymentId } = await createPayment(request);
    const start = Date.now();
    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');

    const body = await parseJsonRecord(response);
    validateSchema(body, 'payment-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[DP-13] @smoke Given newly created payment, when retrieved by DomesticPaymentId, then response echoes the same DomesticPaymentId', async ({ request }) => {
    const { domesticPaymentId } = await createPayment(request);
    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(getDataString(body, 'DomesticPaymentId')).toBe(domesticPaymentId);
  });

  test('[DP-14] @smoke Given any payment identifier, when payment retrieved without authorization header, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get('/domestic-payments/any-payment-id', {
      headers: headersWithoutAuth(),
    });

    expect(response.status()).toBe(401);
  });

  test('[DP-15] @smoke Given any payment identifier, when payment retrieved with expired bearer token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get('/domestic-payments/any-payment-id', {
      headers: headersWithInvalidToken(),
    });

    expect(response.status()).toBe(401);
  });

  test('[DP-16] @smoke Given malformed payment identifier, when payment retrieval attempted, then returns 400 bad request', async ({ request }) => {
    const response = await request.get(`/domestic-payments/${encodeURIComponent('<bad-id>')}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(400);
  });

  test('[DP-17] @extended Given read-only scoped credentials, when payment retrieval attempted, then returns 403 forbidden', async ({ request }) => {
    const { domesticPaymentId } = await createPayment(request);
    const readOnlyToken = readOnlyTokenOrSkip();
    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders({ Authorization: `Bearer ${readOnlyToken}` }),
    });

    expect(response.status()).toBe(403);
  });

  test('[DP-18] @smoke Given previously used nonce for payment retrieval, when the same request replayed, then returns 412 precondition failed', async ({ request }) => {
    const { domesticPaymentId } = await createPayment(request);
    const replayedNonce = 'fixed-replay-nonce-payment-get';

    const firstResponse = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
    });

    expect(firstResponse.status()).toBe(200);

    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
    });

    expect(response.status()).toBe(412);
  });

  test('[DP-19] @extended Given rate-limited environment, when payment retrieval attempted, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true to execute rate limit test');

    const { domesticPaymentId } = await createPayment(request);
    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
  });

  test('[DP-EXT-01] @extended Given pre-existing payment in TEST_PAYMENT_ID, when retrieved, then returns 200 with payment data', async ({ request }) => {
    const domesticPaymentId = preExistingPaymentIdOrSkip();
    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(getDataString(body, 'DomesticPaymentId')).toBe(domesticPaymentId);
  });
});
