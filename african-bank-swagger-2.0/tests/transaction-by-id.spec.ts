import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

test.describe('GET /accounts/{accountId}/transactions/{transactionId}', () => {

  test('[TI-01] @smoke Given non-existent transaction ID, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/nonexistent-account-99999/transactions/nonexistent-txn-99999`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[TI-02] @smoke Given transaction by ID endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transactions/some-txn-id`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[TI-03] @smoke Given transaction by ID endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transactions/some-txn-id`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[TI-04] @extended Given read-only scoped credentials, when retrieving transaction by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transactions/some-txn-id`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
