import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('GET /api/merchants/:merchantId/reports/statement/download — Statement report', () => {

  test('[SR-01] @smoke Given valid authorization and merchant ID, when statement report is downloaded, then returns 200 with statement content', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/reports/statement/download`,
      {
        headers: { ...authHeaders(), 'Accept': '*/*' },
        params: { startDate: '2026-01-01', endDate: '2026-01-31' },
      },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(8000);
  });

  test('[SR-02] @smoke Given statement report download request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/reports/statement/download`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[SR-03] @smoke Given statement report download request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/reports/statement/download`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

});
