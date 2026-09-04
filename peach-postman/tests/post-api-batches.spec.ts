import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeBatchPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';

test.describe('POST /api/channels/:entityId/payments/batches — Create batch', () => {

  test('[CB-01] @smoke Given valid batch payload with entity ID, when batch is created, then returns 200 with batch details', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: authHeaders(),
      data: makeBatchPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'batch-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CB-02] @smoke Given create batch request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: headersWithoutAuth(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[CB-03] @smoke Given create batch request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: headersWithInvalidToken(),
      data: {},
    });
    expect(response.status()).toBe(401);
  });

  test('[CB-04] @smoke Given create batch request, when submitted with empty body, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});
