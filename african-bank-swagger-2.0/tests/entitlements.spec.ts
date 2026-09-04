import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /entitlements', () => {

  test('[EN-01] @smoke Given authenticated user, when listing entitlements, then returns 200 with entitlement collection', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/entitlements`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[EN-02] @smoke Given entitlements endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/entitlements`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[EN-03] @smoke Given entitlements endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/entitlements`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[EN-04] @extended Given read-only scoped credentials, when listing entitlements, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/entitlements`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[EN-05] @smoke Given entitlements endpoint at out-of-range resource, when queried, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/entitlements`, {
      headers: authHeaders(),
      params: { page: 999999 },
    });
    expect(response.status()).toBe(404);
  });

});
