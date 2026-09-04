import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentLinkPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';

test.describe('POST /api/channels/:entityId/payments — Generate payment link', () => {

  test('[GL-01] @smoke Given valid payment link parameters, when a payment link is generated, then returns 200 with link details', async ({ request }) => {
    const start = Date.now();
    const payload = makePaymentLinkPayload();
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: authHeaders(),
      data: payload,
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payment-link-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[GL-02] @smoke Given generate link request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[GL-03] @smoke Given generate link request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[GL-04] @smoke Given generate link request, when submitted with empty body, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});
