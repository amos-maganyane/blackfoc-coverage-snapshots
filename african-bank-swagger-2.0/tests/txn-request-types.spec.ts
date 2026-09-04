import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /accounts/{accountId}/transaction-request-types', () => {

  test('[TT-01] @smoke Given non-existent account ID, when requesting transaction request types, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/nonexistent-account-99999/transaction-request-types`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[TT-02] @smoke Given transaction request types endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transaction-request-types`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[TT-03] @smoke Given transaction request types endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transaction-request-types`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[TT-04] @extended Given read-only scoped credentials, when requesting transaction request types, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transaction-request-types`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
