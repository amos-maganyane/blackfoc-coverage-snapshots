import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeBeneficiaryTransactionRequestPayload, makeCreateAccountPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /accounts/{accountId}/transaction-requests/BENEFICIARY', () => {

  test('[BT-01] @smoke Given valid account and beneficiary payload, when transaction request submitted, then returns 201 with transaction details', async ({ request }) => {
    const acctResp = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: makeCreateAccountPayload(),
    });
    expect(acctResp.status()).toBe(201);
    const account = await acctResp.json();
    const accountId: string = account.id ?? account.accountId ?? account.data?.id;
    expect(accountId).toBeDefined();

    const response = await request.post(
      `${API_BASE}/accounts/${accountId}/transaction-requests/BENEFICIARY`,
      {
        headers: authHeaders(),
        data: makeBeneficiaryTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(201);
  });

  test('[BT-02] @smoke Given valid beneficiary transaction payload, when submitted to non-existent account, then returns 404 not found', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/accounts/nonexistent-account-99999/transaction-requests/BENEFICIARY`,
      {
        headers: authHeaders(),
        data: makeBeneficiaryTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[BT-03] @smoke Given beneficiary transaction endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/accounts/some-account-id/transaction-requests/BENEFICIARY`,
      {
        headers: headersWithoutAuth(),
        data: makeBeneficiaryTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[BT-04] @smoke Given beneficiary transaction endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/accounts/some-account-id/transaction-requests/BENEFICIARY`,
      {
        headers: headersWithInvalidToken(),
        data: makeBeneficiaryTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[BT-05] @extended Given read-only scoped credentials, when submitting beneficiary transaction, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(
      `${API_BASE}/accounts/some-account-id/transaction-requests/BENEFICIARY`,
      {
        headers: headersWithReadOnlyToken(),
        data: makeBeneficiaryTransactionRequestPayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});
