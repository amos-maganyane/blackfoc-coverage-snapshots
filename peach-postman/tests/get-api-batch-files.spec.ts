import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';

const API_BASE = process.env.API_BASE!;
const EXISTING_BATCH_ID = process.env.EXISTING_BATCH_ID;

test.describe('GET /api/batches/:batchId/files — Retrieve batch error files', () => {

  test('[BEF-01] @extended Given a batch with error files, when error files are retrieved by batchId, then returns 200 with file list',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_BATCH_ID,
        'Set EXISTING_BATCH_ID in .env to enable — requires a batch with error files',
      );

      const start = Date.now();
      const response = await request.get(`${API_BASE}/api/batches/${EXISTING_BATCH_ID}/files`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      expect(duration).toBeLessThan(5000);
    });

  test('[BEF-02] @smoke Given retrieve batch error files request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/batches/non-existent-id/files`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[BEF-03] @smoke Given retrieve batch error files request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/batches/non-existent-id/files`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
