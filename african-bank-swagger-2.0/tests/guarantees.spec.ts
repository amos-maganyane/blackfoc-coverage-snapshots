import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /guarantees/{guaranteeID}/state', () => {

  test('[GU-05] @extended Given a pre-existing guarantee ID, when retrieving state, then returns 200', async ({ request }) => {
    const guaranteeId = process.env.TEST_GUARANTEE_ID;
    test.skip(!guaranteeId, 'Skipped: set TEST_GUARANTEE_ID to a real guarantee ID to execute');

    const response = await request.get(
      `${API_BASE}/guarantees/${guaranteeId}/state`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(200);
  });

  test('[GU-01] @smoke Given non-existent guarantee ID, when retrieving state, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/guarantees/nonexistent-guarantee-99999/state`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[GU-02] @smoke Given guarantee state endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/guarantees/some-guarantee-id/state`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[GU-03] @smoke Given guarantee state endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/guarantees/some-guarantee-id/state`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[GU-04] @extended Given read-only scoped credentials, when retrieving guarantee state, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/guarantees/some-guarantee-id/state`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
