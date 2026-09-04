import { test, expect } from '@playwright/test';
import { authHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentLinkPayload, makeWebhookSubscriptionPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ============================
// Workflow: Payment Link lifecycle (create → read → delete)
// ============================
test.describe('Workflow: Payment Link lifecycle', () => {

  test('[WF-01] @smoke Given authorized credentials, when payment link is created then retrieved then deleted, then all steps succeed', async ({ request }) => {
    // Step 1: Create
    const createResp = await request.post(`${API_BASE}/v1/payment_links/`, {
      headers: authHeaders(),
      data: makePaymentLinkPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    validateSchema(created, 'payment-link-response.json');
    const paymentLinkId: string = created.id;
    expect(paymentLinkId).toBeDefined();

    // Step 2: Fetch
    const fetchResp = await request.get(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
      headers: authHeaders(),
    });
    expect(fetchResp.status()).toBe(200);
    const fetched = await fetchResp.json();
    expect(fetched.id).toBe(paymentLinkId); // Identity echo

    // Step 3: Delete
    const deleteResp = await request.delete(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
      headers: authHeaders(),
    });
    expect(deleteResp.status()).toBe(204);

    // Step 4: Verify deleted → 404
    const verifyResp = await request.get(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
      headers: authHeaders(),
    });
    expect(verifyResp.status()).toBe(404);
  });
});

// ============================
// Workflow: Webhook Subscription lifecycle (create → read → update → rotate secret → delete)
// ============================
test.describe('Workflow: Webhook Subscription lifecycle', () => {

  test('[WF-02] @smoke Given authorized credentials, when webhook subscription is created, retrieved, updated, and deleted, then all steps succeed', async ({ request }) => {
    // Step 1: Create
    const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/`, {
      headers: authHeaders(),
      data: makeWebhookSubscriptionPayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    validateSchema(created, 'webhook-subscription-response.json');
    const subscriptionId: string = created.id;
    expect(subscriptionId).toBeDefined();

    // Step 2: Fetch
    const fetchResp = await request.get(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
    });
    expect(fetchResp.status()).toBe(200);
    const fetched = await fetchResp.json();
    expect(fetched.id).toBe(subscriptionId); // Identity echo

    // Step 3: Update
    const updateResp = await request.patch(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
      data: { events: ['payment.succeeded', 'payment.failed'] },
    });
    expect(updateResp.status()).toBe(200);

    // Step 4: Rotate secret
    const rotateResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/secret`, {
      headers: authHeaders(),
    });
    expect(rotateResp.status()).toBe(200);

    // Step 5: Delete
    const deleteResp = await request.delete(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
    });
    expect(deleteResp.status()).toBe(204);

    // Step 6: Verify deleted → 404
    const verifyResp = await request.get(`${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`, {
      headers: authHeaders(),
    });
    expect(verifyResp.status()).toBe(404);
  });
});

// ============================
// Workflow: List pagination (verify cursor-based pagination)
// ============================
test.describe('Workflow: Paginated list navigation', () => {

  test('[WF-03] @smoke Given authorized credentials, when listing payments with limit=1, then returns list with at most 1 item', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/payments/`, {
      headers: authHeaders(),
      params: { limit: '1' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    validateSchema(body, 'paginated-list-response.json');
    expect(body.items.length).toBeLessThanOrEqual(1);
  });
});
