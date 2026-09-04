import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeIndividualFicaPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// POST /fica/individuals
// ===========================
test.describe('POST /fica/individuals', () => {

  test('[FI-01] @smoke Given valid FICA payload, when submitted with authorized credentials, then returns 201 with FICA record', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/fica/individuals`, {
      headers: authHeaders(),
      data: makeIndividualFicaPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    const body = await response.json();
    validateSchema(body, 'fica-response.json');
    expect(response.headers()['content-type']).toContain('application/json');
    expect(duration).toBeLessThan(5000);
  });

  test('[FI-02] @smoke Given FICA creation endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/fica/individuals`, {
      headers: headersWithoutAuth(),
      data: makeIndividualFicaPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[FI-03] @smoke Given FICA creation endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/fica/individuals`, {
      headers: headersWithInvalidToken(),
      data: makeIndividualFicaPayload(),
    });
    expect(response.status()).toBe(401);
  });

  test('[FI-04] @extended Given read-only scoped credentials, when creating FICA record, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.post(`${API_BASE}/fica/individuals`, {
      headers: headersWithReadOnlyToken(),
      data: makeIndividualFicaPayload(),
    });
    expect(response.status()).toBe(403);
  });

  test('[FI-05] @smoke Given empty body, when creating FICA record, then returns 400', async ({ request }) => {
    const response = await request.post(`${API_BASE}/fica/individuals`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('[FI-05A] @smoke Given nonexistent customerId in the payload, when creating FICA record, then returns 404 not found', async ({ request }) => {
    const response = await request.post(`${API_BASE}/fica/individuals`, {
      headers: authHeaders(),
      data: {
        ...makeIndividualFicaPayload(),
        customerId: 'nonexistent-customer-id-99999',
      },
    });
    expect(response.status()).toBe(404);
  });

});

// ===========================
// GET /fica/individuals/{ficaId}
// ===========================
test.describe('GET /fica/individuals/{ficaId}', () => {

  test('[FI-06] @smoke Given non-existent FICA ID, when retrieved, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/fica/individuals/nonexistent-fica-99999`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
  });

  test('[FI-07] @smoke Given FICA by ID endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/fica/individuals/some-fica-id`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
  });

  test('[FI-08] @smoke Given FICA by ID endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/fica/individuals/some-fica-id`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
  });

  test('[FI-09] @extended Given read-only scoped credentials, when retrieving FICA by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.get(
      `${API_BASE}/fica/individuals/some-fica-id`,
      { headers: headersWithReadOnlyToken() },
    );
    expect(response.status()).toBe(403);
  });

});
