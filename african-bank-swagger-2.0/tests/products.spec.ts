import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';

const API_BASE = process.env.API_BASE!;

// ===========================
// GET /products
// ===========================
test.describe('GET /products', () => {

  test('[PR-01] @smoke Given authenticated user, when listing products, then returns 200 with product collection', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/products`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[PR-02] @smoke Given products endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
  });

  test('[PR-03] @smoke Given products endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
  });

  test('[PR-04] @extended Given read-only scoped credentials, when listing products, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(`${API_BASE}/products`, {
      headers: headersWithReadOnlyToken(),
    });
    expect(response.status()).toBe(403);
  });

  test('[PR-05] @smoke Given products endpoint at out-of-range page, when queried, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`, {
      headers: authHeaders(),
      params: { page: 999999, size: 1 },
    });
    expect(response.status()).toBe(404);
  });

});

// ===========================
// GET /products/{code}
// ===========================
test.describe('GET /products/{code}', () => {

  test('[PR-06] @smoke Given non-existent product code, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/products/NONEXISTENT-CODE-99999`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[PR-07] @smoke Given product by code endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/products/SOME-CODE`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[PR-08] @smoke Given product by code endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/products/SOME-CODE`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[PR-09] @extended Given read-only scoped credentials, when retrieving product by code, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/products/SOME-CODE`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
