import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeV2CheckoutPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('GET /v2/checkout/{checkoutId}/status — Query Checkout status v2', () => {

  test('[V2S-01] @smoke Given a valid checkout session, when checkout status is queried by checkoutId, then returns 200 with status details', async ({ request }) => {
    const createResponse = await request.post(`${API_BASE}/v2/checkout`, {
      headers: authHeaders(),
      data: makeV2CheckoutPayload(),
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json() as { id?: string };
    const checkoutId = createBody.id ?? 'non-existent-checkout-id';

    const start = Date.now();
    const response = await request.get(`${API_BASE}/v2/checkout/${checkoutId}/status`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'v2-checkout-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[V2S-02] @smoke Given v2 checkout status request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v2/checkout/non-existent-id/status`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[V2S-03] @smoke Given v2 checkout status request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v2/checkout/non-existent-id/status`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
