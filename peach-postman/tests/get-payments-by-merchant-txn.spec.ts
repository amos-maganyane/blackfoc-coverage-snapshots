import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken, checkoutAuthParams } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { uniqueId } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('GET /payments — Query transaction by merchantTransactionId', () => {

  test('[QTM-01] @smoke Given valid auth credentials and merchantTransactionId, when transaction is queried, then returns 200 with transaction result', async ({ request }) => {
    const start = Date.now();
    const authParams = checkoutAuthParams();
    const response = await request.get(`${API_BASE}/payments`, {
      headers: { 'Accept': 'application/json' },
      params: {
        'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user',
        'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
        'authentication.entityId': authParams.entityId,
        'merchantTransactionId': uniqueId('TXN'),
      },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'transaction-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[QTM-02] @smoke Given query transaction request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/payments`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[QTM-03] @smoke Given query transaction request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/payments`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
