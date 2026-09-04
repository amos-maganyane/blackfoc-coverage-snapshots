import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';

const API_BASE = process.env.API_BASE!;

test.describe('GET /api/payments — Export all merchant payment links', () => {

  test('[EP-01] @smoke Given valid authorization, when all merchant payment links are exported, then returns 200 with payment links list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/api/payments`, {
      headers: authHeaders(),
      params: { perPage: '10', offset: '0' },
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    validateSchema(body, 'payment-links-list-response.json');
    expect(duration).toBeLessThan(8000);
  });

  test('[EP-02] @smoke Given export payment links request, when submitted without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payments`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[EP-03] @smoke Given export payment links request, when submitted with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payments`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

});
