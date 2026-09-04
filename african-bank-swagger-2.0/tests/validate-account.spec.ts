import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeValidateAccountPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /validate/accountnumber', () => {

  test('[VA-01] @smoke Given valid account number payload, when submitted with authorized credentials, then returns 200', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/validate/accountnumber`, {
      headers: authHeaders(),
      data: makeValidateAccountPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[VA-02] @smoke Given validate account endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/validate/accountnumber`, {
      headers: headersWithoutAuth(),
      data: makeValidateAccountPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[VA-03] @smoke Given validate account endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/validate/accountnumber`, {
      headers: headersWithInvalidToken(),
      data: makeValidateAccountPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[VA-04] @extended Given read-only scoped credentials, when validating account number, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(`${API_BASE}/validate/accountnumber`, {
      headers: headersWithReadOnlyToken(),
      data: makeValidateAccountPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('[VA-05] @smoke Given unknown bank code in payload, when validating account number, then returns 404 not found', async ({ request }) => {
    const response = await request.post(`${API_BASE}/validate/accountnumber`, {
      headers: authHeaders(),
      data: { accountNumber: '9999999999', bankId: 'NONEXISTENT-BANK-99999', branchCode: '000000' },
    });
    expect(response.status()).toBe(404);
  });

});
