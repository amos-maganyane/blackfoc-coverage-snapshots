import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentLinkPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';

test.describe('GET /api/payments/:paymentId — Query payment link status', () => {

  test('[QP-01] @smoke Given an existing payment link, when queried by paymentId, then returns 200 with payment status details', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    const paymentId = createBody.id ?? 'non-existent-id';

    const start = Date.now();
    const response = await request.get(`${API_BASE}/api/payments/${paymentId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payment-link-status-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[QP-02] @smoke Given query payment status request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payments/non-existent-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[QP-03] @smoke Given query payment status request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payments/non-existent-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
