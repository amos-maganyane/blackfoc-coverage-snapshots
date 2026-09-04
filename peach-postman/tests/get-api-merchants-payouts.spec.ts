import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('GET /api/merchants/:merchantId/payouts — List payouts', () => {

  test('[LP-01] @smoke Given valid authorization and merchant ID, when payouts are listed, then returns 200 with payouts list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payouts-list-response.json');
    expect(duration).toBeLessThan(8000);
  });

  test('[LP-02] @smoke Given list payouts request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[LP-03] @smoke Given list payouts request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
