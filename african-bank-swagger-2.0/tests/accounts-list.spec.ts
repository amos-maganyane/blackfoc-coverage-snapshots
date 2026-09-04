import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateAccountPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// GET /accounts
// ===========================
test.describe('GET /accounts', () => {

  test('[AC-01] @smoke Given authenticated user, when listing accounts, then returns 200 with account collection', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/accounts`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    const body = await response.json();
    validateSchema(body[0] ?? body.data?.[0] ?? body, 'account-response.json');
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[AC-02] @smoke Given accounts endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AC-03] @smoke Given accounts endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AC-04] @extended Given read-only scoped credentials, when listing accounts, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
    const response = await request.get(`${API_BASE}/accounts`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[AC-05] @smoke Given accounts endpoint with nonexistent customerId filter, when queried, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      params: { customerId: 'nonexistent-customer-id-99999' },
    });
    expect(response.status()).toBe(404);
  });

});

// ===========================
// POST /accounts
// ===========================
test.describe('POST /accounts', () => {

  test('[AC-06] @smoke Given valid account creation payload, when submitted with authorized credentials, then returns 201 with account data', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: makeCreateAccountPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[AC-07] @smoke Given account creation endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/accounts`, {
      headers: headersWithoutAuth(),
      data: makeCreateAccountPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AC-08] @smoke Given account creation endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/accounts`, {
      headers: headersWithInvalidToken(),
      data: makeCreateAccountPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[AC-09] @extended Given read-only scoped credentials, when creating account, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
    const response = await request.post(`${API_BASE}/accounts`, {
      headers: headersWithReadOnlyToken(),
      data: makeCreateAccountPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('[AC-10] @smoke Given empty body, when creating account, then returns 400', async ({ request }) => {
    const response = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('[AC-11] @smoke Given nonexistent customerId in the payload, when creating account, then returns 404 not found', async ({ request }) => {
    const response = await request.post(`${API_BASE}/accounts`, {
      headers: authHeaders(),
      data: {
        ...makeCreateAccountPayload(),
        customerId: 'nonexistent-customer-id-99999',
      },
    });
    expect(response.status()).toBe(404);
  });

});
