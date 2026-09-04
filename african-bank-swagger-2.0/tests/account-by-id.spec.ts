import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateAccountPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('GET /accounts/{accountId}', () => {

  test('[AB-00] @extended Given newly created account ID, when retrieved, then returns 200 with account data', async ({ request }) => {
    const createResponse = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: makeCreateAccountPayload(),
    });
    expect(createResponse.status()).toBe(201);

    const createdAccount = await createResponse.json();
    const accountId: string = createdAccount.id ?? createdAccount.accountId ?? createdAccount.data?.id;
    expect(accountId).toBeDefined();

    const response = await request.get(`${API_BASE}/accounts/${accountId}`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    validateSchema(body, 'account-response.json');
  });

  test('[AB-01] @smoke Given non-existent account ID, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts/nonexistent-account-id-99999`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
  });

  test('[AB-02] @smoke Given account endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts/some-account-id`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AB-03] @smoke Given account endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts/some-account-id`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AB-04] @extended Given read-only scoped credentials, when retrieving account by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/accounts/some-account-id`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

});
