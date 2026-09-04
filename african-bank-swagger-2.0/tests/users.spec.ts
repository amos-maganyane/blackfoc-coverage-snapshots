import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateUserPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// POST /users
// ===========================
test.describe('POST /users', () => {

  test('[US-01] @smoke Given valid user creation payload, when submitted with authorized credentials, then returns 201 with user data', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/users`, {
      headers: authHeaders(),
      data: makeCreateUserPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    const body = await response.json();
    validateSchema(body, 'user-response.json');
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[US-02] @smoke Given user creation endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/users`, {
      headers: headersWithoutAuth(),
      data: makeCreateUserPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[US-03] @smoke Given user creation endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/users`, {
      headers: headersWithInvalidToken(),
      data: makeCreateUserPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[US-04] @extended Given read-only scoped credentials, when creating user, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(`${API_BASE}/users`, {
      headers: headersWithReadOnlyToken(),
      data: makeCreateUserPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('[US-05] @smoke Given empty body, when creating user, then returns 400', async ({ request }) => {
    const response = await request.post(`${API_BASE}/users`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

});

// ===========================
// GET /users/current/customers
// ===========================
test.describe('GET /users/current/customers', () => {

  test('[US-06] @smoke Given authenticated user, when listing current user customers, then returns 200', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/users/current/customers`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[US-07] @smoke Given current user customers endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/current/customers`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[US-08] @smoke Given current user customers endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/current/customers`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[US-09] @extended Given read-only scoped credentials, when listing current user customers, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/users/current/customers`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[US-10] @smoke Given current user customers endpoint, when user has no associated customers, then returns 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/current/customers`, {
      headers: authHeaders(),
      params: { page: 999999 },
    });
    expect(response.status()).toBe(404);
  });

});

// ===========================
// GET /users/current/entitlements
// ===========================
test.describe('GET /users/current/entitlements', () => {

  test('[US-11] @smoke Given authenticated user, when listing current user entitlements, then returns 200', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/users/current/entitlements`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[US-12] @smoke Given current user entitlements endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/current/entitlements`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[US-13] @smoke Given current user entitlements endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/current/entitlements`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[US-14] @extended Given read-only scoped credentials, when listing current user entitlements, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/users/current/entitlements`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[US-15] @smoke Given current user entitlements endpoint at out-of-range page, when queried, then returns 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/current/entitlements`, {
      headers: authHeaders(),
      params: { pageNumber: 999999 },
    });
    expect(response.status()).toBe(404);
  });

});
