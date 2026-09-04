import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePayoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';
const EXISTING_PAYOUT_ID = process.env.EXISTING_PAYOUT_ID;

test.describe('GET /api/merchants/:merchantId/payouts/:payoutRequestId/status — Query payout status', () => {

  test('[QPS-01] @smoke Given an existing payout, when queried by payoutRequestId, then returns 200 with payout status', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: authHeaders(),
      data: makePayoutPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    const payoutId = createBody.id ?? 'non-existent-payout-id';

    const start = Date.now();
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/payouts/${payoutId}/status`,
      { headers: authHeaders() },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payout-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[QPS-02] @smoke Given query payout status request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/payouts/non-existent-id/status`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[QPS-03] @smoke Given query payout status request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/payouts/non-existent-id/status`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

});
