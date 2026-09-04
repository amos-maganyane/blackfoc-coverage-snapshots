import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateCustomerPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// GET /customers
// ===========================
test.describe('GET /customers', () => {

  test('[CU-01] @smoke Given authenticated user, when listing customers, then returns 200 with customer collection', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/customers`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    const body = await response.json();
    validateSchema(body[0] ?? body.data?.[0] ?? body, 'customer-response.json');
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CU-02] @smoke Given customers endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/customers`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[CU-03] @smoke Given customers endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/customers`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[CU-04] @extended Given read-only scoped credentials, when listing customers, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/customers`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[CU-05] @smoke Given customers endpoint at out-of-range page, when queried, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/customers`, {
      headers: authHeaders(),
      params: { page: 999999, size: 1 },
    });
    expect(response.status()).toBe(404);
  });

});

// ===========================
// POST /customers
// ===========================
test.describe('POST /customers', () => {

  test('[CU-06] @smoke Given valid customer creation payload, when submitted with authorized credentials, then returns 201 with customer data', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: makeCreateCustomerPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[CU-07] @smoke Given customer creation endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/customers`, {
      headers: headersWithoutAuth(),
      data: makeCreateCustomerPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[CU-08] @smoke Given customer creation endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/customers`, {
      headers: headersWithInvalidToken(),
      data: makeCreateCustomerPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[CU-09] @extended Given read-only scoped credentials, when creating customer, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(`${API_BASE}/customers`, {
      headers: headersWithReadOnlyToken(),
      data: makeCreateCustomerPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('[CU-10] @smoke Given empty body, when creating customer, then returns 400', async ({ request }) => {
    const response = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});
