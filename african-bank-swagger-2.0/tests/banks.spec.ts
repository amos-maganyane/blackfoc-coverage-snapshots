import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /banks', () => {

  test('[BK-01] @smoke Given authenticated user, when listing banks, then returns 200 with bank collection', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/banks`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[BK-02] @smoke Given banks endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/banks`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[BK-03] @smoke Given banks endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/banks`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[BK-04] @extended Given read-only scoped credentials, when listing banks, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/banks`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[BK-05] @smoke Given banks endpoint with filters resulting in empty set, when queried, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/banks`, {
      headers: authHeaders(),
      params: { page: 999999, size: 1 },
    });
    expect(response.status()).toBe(404);
  });

});
