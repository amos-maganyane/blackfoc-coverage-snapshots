import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateCustomerPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('GET /customers/{customerId}', () => {

  test('[CB-00] @extended Given newly created customer ID, when retrieved, then returns 200 with customer data', async ({ request }) => {
    const createResponse = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: makeCreateCustomerPayload(),
    });
    expect(createResponse.status()).toBe(201);

    const createdCustomer = await createResponse.json();
    const customerId: string = createdCustomer.id ?? createdCustomer.customerId ?? createdCustomer.data?.id;
    expect(customerId).toBeDefined();

    const response = await request.get(
      `${API_BASE}/customers/${customerId}`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    validateSchema(body, 'customer-response.json');
  });

  test('[CB-01] @smoke Given non-existent customer ID, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/nonexistent-customer-99999`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[CB-02] @smoke Given customer by ID endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[CB-03] @smoke Given customer by ID endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[CB-04] @extended Given read-only scoped credentials, when retrieving customer by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
