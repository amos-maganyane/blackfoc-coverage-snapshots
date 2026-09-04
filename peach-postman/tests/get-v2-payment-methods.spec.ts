import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';

test.describe('GET /v2/channels/{entityId}/payment-methods — Retrieve payment methods for a currency', () => {

  test('[PM-01] @smoke Given valid entity ID and currency, when payment methods are retrieved, then returns 200 with payment methods list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/v2/channels/${ENTITY_ID}/payment-methods`, {
      headers: authHeaders(),
      params: { currency: 'ZAR' },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'v2-payment-methods-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[PM-02] @smoke Given payment methods request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v2/channels/${ENTITY_ID}/payment-methods`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[PM-03] @smoke Given payment methods request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v2/channels/${ENTITY_ID}/payment-methods`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
