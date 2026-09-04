import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeBanvPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';
const EXISTING_BANV_ID = process.env.EXISTING_BANV_ID;

test.describe('GET /api/merchants/:merchantId/banv/:bankVerificationId/status — Bank account verification status', () => {

  test('[BVS-01] @smoke Given an existing BANV request, when queried by bankVerificationId, then returns 200 with verification status', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/banv`, {
      headers: authHeaders(),
      data: makeBanvPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    const banvId = createBody.id ?? 'non-existent-banv-id';

    const start = Date.now();
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/banv/${banvId}/status`,
      { headers: authHeaders() },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'banv-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[BVS-02] @smoke Given BANV status request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/banv/non-existent-id/status`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[BVS-03] @smoke Given BANV status request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/banv/non-existent-id/status`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

});
