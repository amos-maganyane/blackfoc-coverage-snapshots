import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';

const API_BASE = process.env.API_BASE!;
const EXISTING_PAYMENT_ID = process.env.EXISTING_PAYMENT_ID;
const EXISTING_FILE_ID = process.env.EXISTING_FILE_ID;

test.describe('GET /api/payments/:paymentId/files/:fileId — Download a file', () => {

  test('[DF-01] @extended Given an existing payment with an attached file, when the file is downloaded by fileId, then returns 200 with file content',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_PAYMENT_ID || !EXISTING_FILE_ID,
        'Set EXISTING_PAYMENT_ID and EXISTING_FILE_ID in .env to enable — requires pre-existing payment with attachment',
      );

      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/api/payments/${EXISTING_PAYMENT_ID}/files/${EXISTING_FILE_ID}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(8000);
    });

  test('[DF-02] @smoke Given download file request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/payments/non-existent-id/files/non-existent-file`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[DF-03] @smoke Given download file request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/payments/non-existent-id/files/non-existent-file`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

});
