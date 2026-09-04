import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken, READ_ONLY_TOKEN } from './helpers/auth';
import { makeIndividualFicaPayload, makePatchFicaPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ===========================
// PUT /fica/individuals/{ficaId}
// ===========================
test.describe('PUT /fica/individuals/{ficaId}', () => {

  test('[FU-05] @smoke Given a newly created FICA record, when updated with a valid payload, then returns 200', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/fica/individuals`, {
      headers: authHeaders(),
      data: makeIndividualFicaPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const ficaId: string = created.id ?? created.ficaId ?? created.data?.id;
    expect(ficaId).toBeDefined();

    const response = await request.put(
      `${API_BASE}/fica/individuals/${ficaId}`,
      {
        headers: authHeaders(),
        data: makeIndividualFicaPayload(),
      },
    );
    expect(response.status()).toBe(200);
  });

  test('[FU-01] @smoke Given valid FICA update payload, when submitted to non-existent FICA ID, then returns 404 not found', async ({ request }) => {
    const response = await request.put(
      `${API_BASE}/fica/individuals/nonexistent-fica-99999`,
      {
        headers: authHeaders(),
        data: makeIndividualFicaPayload(),
      },
    );
    expect(response.status()).toBe(404);
  });

  test('[FU-02] @smoke Given FICA update endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.put(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: headersWithoutAuth(),
        data: makeIndividualFicaPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[FU-03] @smoke Given FICA update endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.put(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: headersWithInvalidToken(),
        data: makeIndividualFicaPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[FU-04] @extended Given read-only scoped credentials, when updating FICA record, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.put(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: headersWithReadOnlyToken(),
        data: makeIndividualFicaPayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});

// ===========================
// PATCH /fica/individuals/{ficaId}
// ===========================
test.describe('PATCH /fica/individuals/{ficaId}', () => {

  test('[FP-01] @smoke Given valid FICA status patch payload, when submitted with authorized credentials, then returns 200', async ({ request }) => {
    const start = Date.now();
    const response = await request.patch(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: authHeaders(),
        data: makePatchFicaPayload(),
      },
    );
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);

    expect(duration).toBeLessThan(5000);
  });

  test('[FP-02] @smoke Given FICA status patch endpoint, when called without authorization, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.patch(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: headersWithoutAuth(),
        data: makePatchFicaPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[FP-03] @smoke Given FICA status patch endpoint, when called with invalid token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.patch(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: headersWithInvalidToken(),
        data: makePatchFicaPayload(),
      },
    );
    expect(response.status()).toBe(401);
  });

  test('[FP-04] @extended Given read-only scoped credentials, when patching FICA status, then returns 403 forbidden', async ({ request }) => {
    test.skip(!READ_ONLY_TOKEN, 'Set API_TOKEN_READ_ONLY in .env to enable');
    const response = await request.patch(
      `${API_BASE}/fica/individuals/some-fica-id`,
      {
        headers: headersWithReadOnlyToken(),
        data: makePatchFicaPayload(),
      },
    );
    expect(response.status()).toBe(403);
  });

});
