import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeCreateCustomerMessagePayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// GET /customers/{customerId}/messages
// ===========================
test.describe('GET /customers/{customerId}/messages', () => {

  test('[CM-01] @smoke Given non-existent customer ID, when listing messages, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/nonexistent-customer-99999/messages`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[CM-02] @smoke Given customer messages endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/messages`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[CM-03] @smoke Given customer messages endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/messages`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[CM-04] @extended Given read-only scoped credentials, when listing customer messages, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/messages`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});

// ===========================
// POST /customers/{customerId}/messages
// ===========================
test.describe('POST /customers/{customerId}/messages', () => {

  test('[CM-05] @smoke Given valid message payload, when submitted to non-existent customer, then returns 404 not found', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/customers/nonexistent-customer-99999/messages`,
      {
        headers: authHeaders(),
        data: makeCreateCustomerMessagePayload(),
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[CM-06] @smoke Given create message endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/customers/some-customer-id/messages`,
      {
        headers: headersWithoutAuth(),
        data: makeCreateCustomerMessagePayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[CM-07] @smoke Given create message endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/customers/some-customer-id/messages`,
      {
        headers: headersWithInvalidToken(),
        data: makeCreateCustomerMessagePayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[CM-08] @extended Given read-only scoped credentials, when creating customer message, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(
      `${API_BASE}/customers/some-customer-id/messages`,
      {
        headers: headersWithReadOnlyToken(),
        data: makeCreateCustomerMessagePayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});
