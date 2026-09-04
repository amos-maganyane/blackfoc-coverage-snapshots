import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /investment-types', () => {

  test('[IT-01] @smoke Given authenticated user, when listing investment types, then returns 200 with investment type collection', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/investment-types`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[IT-02] @smoke Given investment types endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/investment-types`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[IT-03] @smoke Given investment types endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/investment-types`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[IT-04] @extended Given read-only scoped credentials, when listing investment types, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/investment-types`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[IT-05] @smoke Given investment types endpoint at out-of-range page, when queried, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/investment-types`, {
      headers: authHeaders(),
      params: { page: 999999, size: 1 },
    });
    expect(response.status()).toBe(404);
  });

});
