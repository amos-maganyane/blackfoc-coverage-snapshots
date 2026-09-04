import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeAvsRequestPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('POST /verifications/account', () => {

  test('[VR-01] @smoke Given valid AVS request payload, when submitted with authorized credentials, then returns 200', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/verifications/account`, {
      headers: authHeaders(),
      data: makeAvsRequestPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[VR-02] @smoke Given account verification endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/verifications/account`, {
      headers: headersWithoutAuth(),
      data: makeAvsRequestPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[VR-03] @smoke Given account verification endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/verifications/account`, {
      headers: headersWithInvalidToken(),
      data: makeAvsRequestPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[VR-04] @extended Given read-only scoped credentials, when verifying account, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(`${API_BASE}/verifications/account`, {
      headers: headersWithReadOnlyToken(),
      data: makeAvsRequestPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('[VR-05] @smoke Given nonexistent account number in AVS payload, when verifying, then returns 404 not found', async ({ request }) => {
    const response = await request.post(`${API_BASE}/verifications/account`, {
      headers: authHeaders(),
      data: { accountNumber: '0000000000000', idNumber: '9999999999999', name: 'NONEXISTENT' },
    });
    expect(response.status()).toBe(404);
  });

});
