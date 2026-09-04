import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateCustomerPayload, makeCreateBeneficiaryPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// GET /customers/{customerId}/beneficiaries
// ===========================
test.describe('GET /customers/{customerId}/beneficiaries', () => {

  test('[BE-00] @extended Given newly created beneficiary, when listing beneficiaries for its customer, then returns 200 with beneficiary collection', async ({ request }) => {
    const createCustomerResponse = await request.post(`${API_BASE}/customers`, {
      headers: authHeaders(),
      data: makeCreateCustomerPayload(),
    });
    expect(createCustomerResponse.status()).toBe(201);

    const createdCustomer = await createCustomerResponse.json();
    const customerId: string = createdCustomer.id ?? createdCustomer.customerId ?? createdCustomer.data?.id;
    expect(customerId).toBeDefined();

    const createBeneficiaryResponse = await request.post(
      `${API_BASE}/customers/${customerId}/beneficiaries`,
      {
        headers: authHeaders(),
        data: makeCreateBeneficiaryPayload(),
      },
    );
    expect(createBeneficiaryResponse.status()).toBe(201);

    const response = await request.get(
      `${API_BASE}/customers/${customerId}/beneficiaries`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    validateSchema(body[0] ?? body.data?.[0] ?? body, 'beneficiary-response.json');
  });

  test('[BE-01] @smoke Given non-existent customer ID, when listing beneficiaries, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/nonexistent-customer-99999/beneficiaries`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[BE-02] @smoke Given beneficiaries endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/beneficiaries`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[BE-03] @smoke Given beneficiaries endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/beneficiaries`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[BE-04] @extended Given read-only scoped credentials, when listing beneficiaries, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/beneficiaries`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});

// ===========================
// POST /customers/{customerId}/beneficiaries
// ===========================
test.describe('POST /customers/{customerId}/beneficiaries', () => {

  test('[BE-05] @smoke Given valid beneficiary payload, when submitted to non-existent customer, then returns 404 not found', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/customers/nonexistent-customer-99999/beneficiaries`,
      {
        headers: authHeaders(),
        data: makeCreateBeneficiaryPayload(),
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[BE-06] @smoke Given create beneficiary endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/customers/some-customer-id/beneficiaries`,
      {
        headers: headersWithoutAuth(),
        data: makeCreateBeneficiaryPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[BE-07] @smoke Given create beneficiary endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(
      `${API_BASE}/customers/some-customer-id/beneficiaries`,
      {
        headers: headersWithInvalidToken(),
        data: makeCreateBeneficiaryPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[BE-08] @extended Given read-only scoped credentials, when creating beneficiary, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(
      `${API_BASE}/customers/some-customer-id/beneficiaries`,
      {
        headers: headersWithReadOnlyToken(),
        data: makeCreateBeneficiaryPayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});
