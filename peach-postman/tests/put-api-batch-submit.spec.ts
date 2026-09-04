import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeBatchPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';
const EXISTING_BATCH_ID = process.env.EXISTING_BATCH_ID;

test.describe('PUT (Submit batch) — Submit batch for processing', () => {

  test('[SB-01] @extended Given a created batch, when the batch is submitted for processing, then returns 200 confirming submission',
    { tag: ['@extended'] },
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
        headers: authHeaders(),
        data: makeBatchPayload(),
      });
      expect(createResp.status()).toBe(200);
      const createBody = await createResp.json() as { id?: string };
      const batchId = createBody.id;
      test.skip(!batchId, 'Batch creation did not return an ID — cannot submit');

      const response = await request.put(
        `${API_BASE}/api/channels/${ENTITY_ID}/payments/batches/${batchId}`,
        { headers: authHeaders(), data: {} },
      );
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      validateSchema(body, 'batch-response.json');
    });

  test('[SB-02] @smoke Given submit batch request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.put(
      `${API_BASE}/api/channels/${ENTITY_ID}/payments/batches/non-existent-id`,
      { headers: headersWithoutAuth(), data: {} },
    );
    expect(response.status()).toBe(401);
  });

  test('[SB-03] @smoke Given submit batch request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.put(
      `${API_BASE}/api/channels/${ENTITY_ID}/payments/batches/non-existent-id`,
      { headers: headersWithInvalidToken(), data: {} },
    );
    expect(response.status()).toBe(401);
  });

});
