import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';

const API_BASE = process.env.API_BASE!;
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('GET /api/merchants/:merchantId/reports/payouts/download — Transaction report', () => {

  test('[TR-01] @smoke Given valid authorization and merchant ID, when payout transaction report is downloaded, then returns 200 with report content', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/reports/payouts/download`,
      {
        headers: { ...authHeaders(), 'Accept': '*/*' },
        params: { startDate: '2026-01-01', endDate: '2026-01-31' },
      },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(8000);
  });

  test('[TR-02] @smoke Given transaction report download request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/reports/payouts/download`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[TR-03] @smoke Given transaction report download request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/reports/payouts/download`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

});
