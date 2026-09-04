import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeBatchPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';

test.describe('GET /api/batches/:batchId — Query batch status', () => {

  test('[QBS-01] @smoke Given an existing batch, when queried by batchId, then returns 200 with batch status', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: authHeaders(),
      data: makeBatchPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    const batchId = createBody.id ?? 'non-existent-id';

    const start = Date.now();
    const response = await request.get(`${API_BASE}/api/batches/${batchId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'batch-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[QBS-02] @smoke Given query batch status request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/batches/non-existent-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[QBS-03] @smoke Given query batch status request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/batches/non-existent-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
