import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePayoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('POST /api/merchants/:merchantId/payouts — Create payouts', () => {

  test('[PO-01] @smoke Given valid payout payload and merchant ID, when a payout is created, then returns 200 with payout details', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: authHeaders(),
      data: makePayoutPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payout-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[PO-02] @smoke Given create payout request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[PO-03] @smoke Given create payout request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[PO-04] @smoke Given create payout request, when submitted with empty body, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});
