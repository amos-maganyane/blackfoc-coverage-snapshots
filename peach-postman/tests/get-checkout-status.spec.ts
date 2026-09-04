import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken, checkoutAuthParams } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
const API_BASE = process.env.API_BASE!;

test.describe('GET /status — Query Checkout status', () => {

  test('[CS-01] @smoke Given valid checkout auth parameters, when checkout status is queried by merchantTransactionId, then returns 200 with status result', async ({ request }) => {
    const start = Date.now();
    const authParams = checkoutAuthParams();
    const response = await request.get(`${API_BASE}/status`, {
      headers: { 'Accept': 'application/json' },
      params: {
        'authentication.entityId': authParams.entityId,
        'merchantTransactionId': `TEST-${Date.now()}`,
        'signature': authParams.signature,
      },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'checkout-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CS-02] @smoke Given checkout status request, when submitted without authorization parameters, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/status`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[CS-03] @smoke Given checkout status request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/status`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
