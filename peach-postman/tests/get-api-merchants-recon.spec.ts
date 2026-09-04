import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('GET /api/merchants/:merchantId/transactions-recon — List merchant transactions recon', () => {

  test('[RC-01] @smoke Given valid authorization and merchant ID, when recon transactions are listed, then returns 200 with transaction recon data', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/transactions-recon`,
      {
        headers: authHeaders(),
        params: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        },
      },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'recon-response.json');
    expect(duration).toBeLessThan(8000);
  });

  test('[RC-02] @smoke Given recon transactions request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/transactions-recon`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[RC-03] @smoke Given recon transactions request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/transactions-recon`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

});
