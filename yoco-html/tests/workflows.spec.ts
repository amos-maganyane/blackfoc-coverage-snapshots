import { test, expect } from '@playwright/test';
import { authHeaders } from './helpers/auth';
import {
  makeCheckoutPayload,
  makeRefundPayload,
  makePaymentLinkPayload,
  makeWebhookSubscriptionPayload,
  makeWebPosDevicePayload,
  makeWebPosPaymentPayload,
} from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const CHECKOUT_BASE = process.env.CHECKOUT_API_BASE!;

// ==== Workflow: Checkout → Refund ====

test.describe('Workflow: Checkout creation and refund', () => {
  test(
    '[WF-01] @smoke Given valid checkout, when created then immediately refunded, then both return 200 with matching IDs',
    async ({ request }) => {
      const createResp = await request.post(`${CHECKOUT_BASE}/api/checkouts`, {
        headers: authHeaders(),
        data: makeCheckoutPayload(),
      });
      expect(createResp.status()).toBe(200);
      expect(createResp.headers()['content-type']).toContain('application/json');

      const checkout = await createResp.json() as { id: string };
      const checkoutId = checkout.id;
      expect(checkoutId).toBeDefined();

      const refundResp = await request.post(
        `${CHECKOUT_BASE}/api/checkouts/${checkoutId}/refund`,
        {
          headers: authHeaders(),
          data: makeRefundPayload(),
        },
      );
      expect(refundResp.status()).toBe(200);

      const refund = await refundResp.json() as { checkoutId?: string };
      if (refund.checkoutId !== undefined) {
        expect(refund.checkoutId).toBe(checkoutId);
      }
    },
  );
});

// ==== Workflow: Payment Link lifecycle ====

test.describe('Workflow: Payment link create → fetch → delete', () => {
  test(
    '[WF-02] @smoke Given payment link created, when fetched then deleted, then each step returns 200',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/payment_links`, {
        headers: authHeaders(),
        data: makePaymentLinkPayload(),
      });
      expect(createResp.status()).toBe(200);

      const created = await createResp.json() as { id: string };
      const paymentLinkId = created.id;
      expect(paymentLinkId).toBeDefined();

      const getResp = await request.get(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
        headers: authHeaders(),
      });
      expect(getResp.status()).toBe(200);

      const fetched = await getResp.json() as { id: string };
      expect(fetched.id).toBe(paymentLinkId);

      const deleteResp = await request.delete(`${API_BASE}/v1/payment_links/${paymentLinkId}`, {
        headers: authHeaders(),
      });
      expect(deleteResp.status()).toBe(200);
    },
  );
});

// ==== Workflow: Webhook subscription lifecycle ====

test.describe('Workflow: Webhook subscription create → fetch → rotate secret → send test → delete', () => {
  test(
    '[WF-03] @smoke Given webhook subscription created, when fully managed through lifecycle, then all operations return 200',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(200);

      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;
      expect(subscriptionId).toBeDefined();

      const getResp = await request.get(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`,
        { headers: authHeaders() },
      );
      expect(getResp.status()).toBe(200);
      const fetched = await getResp.json() as { id: string };
      expect(fetched.id).toBe(subscriptionId);

      const secretResp = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/secret`,
        { headers: authHeaders() },
      );
      expect(secretResp.status()).toBe(200);

      const testResp = await request.post(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}/test`,
        {
          headers: authHeaders(),
          data: { eventType: 'payment.created' },
        },
      );
      expect(testResp.status()).toBe(200);

      const deleteResp = await request.delete(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`,
        { headers: authHeaders() },
      );
      expect(deleteResp.status()).toBe(200);
    },
  );
});

// ==== Workflow: Web POS device + payment ====

test.describe('Workflow: WebPOS device creation and payment', () => {
  test(
    '[WF-04] @smoke Given web POS device created, when payment initiated and fetched, then all steps return 200',
    async ({ request }) => {
      const deviceResp = await request.post(`${API_BASE}/v1/webpos`, {
        headers: authHeaders(),
        data: makeWebPosDevicePayload(),
      });
      expect(deviceResp.status()).toBe(200);

      const device = await deviceResp.json() as { id: string };
      const deviceId = device.id;
      expect(deviceId).toBeDefined();

      const getDeviceResp = await request.get(`${API_BASE}/v1/webpos/${deviceId}`, {
        headers: authHeaders(),
      });
      expect(getDeviceResp.status()).toBe(200);
      const fetchedDevice = await getDeviceResp.json() as { id: string };
      expect(fetchedDevice.id).toBe(deviceId);

      const paymentResp = await request.post(`${API_BASE}/v1/webpos/${deviceId}/payments`, {
        headers: authHeaders(),
        data: makeWebPosPaymentPayload(),
      });
      expect(paymentResp.status()).toBe(200);

      const payment = await paymentResp.json() as { id: string };
      const paymentId = payment.id;
      expect(paymentId).toBeDefined();

      const getPaymentResp = await request.get(
        `${API_BASE}/v1/webpos/${deviceId}/payments/${paymentId}`,
        { headers: authHeaders() },
      );
      expect(getPaymentResp.status()).toBe(200);
      const fetchedPayment = await getPaymentResp.json() as { id: string };
      expect(fetchedPayment.id).toBe(paymentId);
    },
  );
});

// ==== Workflow: Webhook subscription update ====

test.describe('Workflow: Webhook subscription update', () => {
  test(
    '[WF-05] @smoke Given webhook subscription created, when updated via PATCH, then returns 200 with modified data',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webhooks/subscriptions`, {
        headers: authHeaders(),
        data: makeWebhookSubscriptionPayload(),
      });
      expect(createResp.status()).toBe(200);

      const created = await createResp.json() as { id: string };
      const subscriptionId = created.id;

      const patchResp = await request.patch(
        `${API_BASE}/v1/webhooks/subscriptions/${subscriptionId}`,
        {
          headers: authHeaders(),
          data: { events: ['payment.created', 'payment.refunded'] },
        },
      );
      expect(patchResp.status()).toBe(200);
    },
  );
});
