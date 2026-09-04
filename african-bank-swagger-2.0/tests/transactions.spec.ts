import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeCreateAccountPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const TODAY = new Date().toISOString().slice(0, 10);
const PAST_DATE = '2024-01-01';

test.describe('GET /accounts/{accountId}/transactions', () => {

  test('[TX-05] @smoke Given a newly created account, when requesting transactions, then returns 200', async ({ request }) => {
    const payload = makeCreateAccountPayload();
    const acctResp = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: payload,
    });
    expect(acctResp.status()).toBe(201);
    const account = await acctResp.json();
    const accountId: string = account.id ?? account.accountId ?? account.data?.id;
    expect(accountId).toBeDefined();

    const response = await request.get(
      `${API_BASE}/accounts/${accountId}/transactions`,
      {
        headers: authHeaders(),
        params: { customerId: payload.customerId, fromDate: PAST_DATE, toDate: TODAY },
      },
    );
    expect(response.status()).toBe(200);
  });

  test('[TX-01] @smoke Given non-existent account ID with required params, when requesting transactions, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/nonexistent-account-99999/transactions`,
      {
        headers: authHeaders(),
        params: { customerId: 'some-customer', fromDate: PAST_DATE, toDate: TODAY },
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[TX-02] @smoke Given transactions endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transactions`,
      {
        headers: headersWithoutAuth(),
        params: { customerId: 'some-customer', fromDate: PAST_DATE, toDate: TODAY },
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[TX-03] @smoke Given transactions endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transactions`,
      {
        headers: headersWithInvalidToken(),
        params: { customerId: 'some-customer', fromDate: PAST_DATE, toDate: TODAY },
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[TX-04] @extended Given read-only scoped credentials, when requesting transactions, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/accounts/some-account-id/transactions`,
      {
        headers: headersWithReadOnlyToken(),
        params: { customerId: 'some-customer', fromDate: PAST_DATE, toDate: TODAY },
      },
    );
    expect(response.status()).toBe(403);
  });

});
