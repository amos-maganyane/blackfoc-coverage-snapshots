import { test, expect } from '@playwright/test';
import { authHeaders } from './helpers/auth';
import { makePaymentLinkPayload, makeBatchPayload, makePayoutPayload, makeBanvPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const ENTITY_ID = process.env.ENTITY_ID ?? 'test-entity-id';
const MERCHANT_ID = process.env.MERCHANT_ID ?? 'test-merchant-id';

test.describe('Workflows — Multi-step chains', () => {

  test('[WF-01] @smoke Given valid credentials, when a payment link is created then retrieved by ID, then the retrieved link matches the created ID', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    expect(createBody.id).toBeDefined();
    const paymentId = createBody.id!;

    const getResp = await request.get(`${API_BASE}/api/payments/${paymentId}`, {
      headers: authHeaders(),
    });
    expect(getResp.status()).toBe(200);
    const getBody = await getResp.json() as { id?: string };
    expect(getBody.id).toBe(paymentId);
  });

  test('[WF-02] @smoke Given valid credentials, when a payment link is created then cancelled, then cancellation returns 200', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    expect(createBody.id).toBeDefined();
    const paymentId = createBody.id!;

    const deleteResp = await request.delete(`${API_BASE}/api/payments/${paymentId}`, {
      headers: authHeaders(),
    });
    expect(deleteResp.status()).toBe(200);
  });

  test('[WF-03] @smoke Given valid credentials, when a batch is created then queried by batchId, then the batch status is returned with matching ID', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/channels/${ENTITY_ID}/payments/batches`, {
      headers: authHeaders(),
      data: makeBatchPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    expect(createBody.id).toBeDefined();
    const batchId = createBody.id!;

    const getResp = await request.get(`${API_BASE}/api/batches/${batchId}`, {
      headers: authHeaders(),
    });
    expect(getResp.status()).toBe(200);
    const getBody = await getResp.json() as { id?: string };
    expect(getBody.id).toBe(batchId);
  });

  test('[WF-04] @smoke Given valid credentials, when a payout is created then its status is queried, then status returns 200', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/payouts`, {
      headers: authHeaders(),
      data: makePayoutPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    expect(createBody.id).toBeDefined();
    const payoutId = createBody.id!;

    const statusResp = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/payouts/${payoutId}/status`,
      { headers: authHeaders() },
    );
    expect(statusResp.status()).toBe(200);
  });

  test('[WF-05] @smoke Given valid credentials, when a BANV is created then its status is queried, then status returns 200', async ({ request }) => {
    const createResp = await request.post(`${API_BASE}/api/merchants/${MERCHANT_ID}/banv`, {
      headers: authHeaders(),
      data: makeBanvPayload(),
    });
    expect(createResp.status()).toBe(200);
    const createBody = await createResp.json() as { id?: string };
    expect(createBody.id).toBeDefined();
    const banvId = createBody.id!;

    const statusResp = await request.get(
      `${API_BASE}/api/merchants/${MERCHANT_ID}/banv/${banvId}/status`,
      { headers: authHeaders() },
    );
    expect(statusResp.status()).toBe(200);
  });

});
