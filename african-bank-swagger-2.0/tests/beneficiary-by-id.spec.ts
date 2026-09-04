import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeCreateBeneficiaryPayload, makeCreateCustomerPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

test.describe('GET /customers/{customerId}/beneficiaries/{beneficiaryId}', () => {

  test('[BI-00] @extended Given newly created beneficiary ID, when retrieved, then returns 200 with beneficiary data', async ({ request }) => {
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

    const createdBeneficiary = await createBeneficiaryResponse.json();
    const beneficiaryId: string = createdBeneficiary.id ?? createdBeneficiary.beneficiaryId ?? createdBeneficiary.data?.id;
    expect(beneficiaryId).toBeDefined();

    const response = await request.get(
      `${API_BASE}/customers/${customerId}/beneficiaries/${beneficiaryId}`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    validateSchema(body, 'beneficiary-response.json');
  });

  test('[BI-01] @smoke Given non-existent beneficiary ID, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/nonexistent-customer-99999/beneficiaries/nonexistent-ben-99999`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[BI-02] @smoke Given beneficiary by ID endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/beneficiaries/some-ben-id`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[BI-03] @smoke Given beneficiary by ID endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/beneficiaries/some-ben-id`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[BI-04] @extended Given read-only scoped credentials, when retrieving beneficiary by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/customers/some-customer-id/beneficiaries/some-ben-id`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
