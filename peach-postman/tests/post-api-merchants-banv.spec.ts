import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeBanvPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('POST /api/merchants/:merchantId/banv — Create bank account verification', () => {

  test('[BV-01] @smoke Given valid bank account details and merchant ID, when BANV is created, then returns 200 with verification details', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/banv`, {
      headers: authHeaders(),
      data: makeBanvPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'banv-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[BV-02] @smoke Given BANV request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/banv`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[BV-03] @smoke Given BANV request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/banv`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[BV-04] @smoke Given BANV request, when submitted with empty body, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/banv`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});
