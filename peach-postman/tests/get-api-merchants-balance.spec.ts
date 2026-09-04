import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('GET /api/merchants/:merchantId/balance — Retrieve balance', () => {

  test('[BAL-01] @smoke Given valid authorization and merchant ID, when balance is retrieved, then returns 200 with balance details', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/api/merchants/${MERCHANT_ID}/balance`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'balance-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[BAL-02] @smoke Given retrieve balance request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/merchants/${MERCHANT_ID}/balance`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[BAL-03] @smoke Given retrieve balance request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/merchants/${MERCHANT_ID}/balance`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
