import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';

test.describe('GET /api/channels/:entityId/payments/batches — Retrieve all batches', () => {

  test('[RB-01] @smoke Given valid authorization and entity ID, when all batches are retrieved, then returns 200 with batch list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'batches-list-response.json');
    expect(duration).toBeLessThan(8000);
  });

  test('[RB-02] @smoke Given retrieve batches request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[RB-03] @smoke Given retrieve batches request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
