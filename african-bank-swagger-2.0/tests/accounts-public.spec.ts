import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /accounts/public', () => {

  test('[AP-01] @smoke Given public accounts endpoint, when called with authorized credentials, then returns 200 with account list', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/accounts/public`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[AP-02] @smoke Given public accounts endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts/public`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AP-03] @smoke Given public accounts endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts/public`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AP-04] @extended Given read-only scoped credentials, when requesting public accounts, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/accounts/public`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[AP-05] @smoke Given nonexistent name filter, when querying public accounts, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts/public`, {
      headers: authHeaders(),
      params: { name: 'nonexistent-public-account-zzz-99999' },
    });
    expect(response.status()).toBe(404);
  });

});
