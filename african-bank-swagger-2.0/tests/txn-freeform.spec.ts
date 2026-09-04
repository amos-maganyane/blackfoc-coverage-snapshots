import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeFreeFormTransactionRequestPayload, makeCreateAccountPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /accounts/{accountId}/transaction-requests/FREE_FORM', () => {

  test('[FF-01] @smoke Given valid account and free form payload, when transaction request submitted, then returns 201 with transaction details', async ({ request }) => {
    const acctResp = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: makeCreateAccountPayload(),
    });
    expect(acctResp.status()).toBe(201);
    const account = await acctResp.json();
    const accountId: string = account.id ?? account.accountId ?? account.data?.id;
    expect(accountId).toBeDefined();

    const response = await request.post(
      `${API_BASE}/accounts/${accountId}/transaction-requests/FREE_FORM`,
      {
        headers: authHeaders(),
        data: makeFreeFormTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(201);
  });

  test('[FF-02] @smoke Given valid free form transaction payload, when submitted to non-existent account, then returns 404 not found', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/accounts/nonexistent-account-99999/transaction-requests/FREE_FORM`,
      {
        headers: authHeaders(),
        data: makeFreeFormTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[FF-03] @smoke Given free form transaction endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/accounts/some-account-id/transaction-requests/FREE_FORM`,
      {
        headers: headersWithoutAuth(),
        data: makeFreeFormTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[FF-04] @smoke Given free form transaction endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/accounts/some-account-id/transaction-requests/FREE_FORM`,
      {
        headers: headersWithInvalidToken(),
        data: makeFreeFormTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[FF-05] @extended Given read-only scoped credentials, when submitting free form transaction, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(
      `${API_BASE}/accounts/some-account-id/transaction-requests/FREE_FORM`,
      {
        headers: headersWithReadOnlyToken(),
        data: makeFreeFormTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});
