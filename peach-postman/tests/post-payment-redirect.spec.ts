import { test, expect } from '@playwright/test';
import { headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

const REDIRECT_PATH =
  '/&amount=1.00&connector=EFTSECURE&currency=ZAR&transaction=fe18dc76af3940978d7de9d0a3486174';

test.describe('POST /&amount=...&connector=... — Payment Redirect Example', () => {

  test('[PR-01] @smoke Given valid redirect payment parameters, when redirect payment is submitted, then returns 200 with payment result', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}${REDIRECT_PATH}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      data: '',
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });

  test('[PR-02] @smoke Given payment redirect request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}${REDIRECT_PATH}`, {
      headers: headersWithoutAuth(),
      data: '',
    });
    expect(response.status()).toBe(401);
  });

  test('[PR-03] @smoke Given payment redirect request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}${REDIRECT_PATH}`, {
      headers: headersWithInvalidToken(),
      data: '',
    });
    expect(response.status()).toBe(401);
  });

});
