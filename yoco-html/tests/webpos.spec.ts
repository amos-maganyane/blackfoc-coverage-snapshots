import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, headersWithReadOnlyToken } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeWebPosDevicePayload, makeWebPosPaymentPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;
const EXISTING_WEBPOS_DEVICE_ID = process.env.EXISTING_WEBPOS_DEVICE_ID;

// ==== POST /v1/webpos ====

test.describe('POST /v1/webpos', () => {
  test(
    '[WPD-01] @smoke Given valid web POS device payload, when created with authorized credentials, then returns 201 with device details',
    async ({ request }) => {
      const start = Date.now();
      const response = await request.post(`${API_BASE}/v1/webpos`, {
        headers: authHeaders(),
        data: makeWebPosDevicePayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(201);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webpos-device-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WPD-02] @smoke Given valid device payload, when submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webpos`, {
        headers: headersWithoutAuth(),
        data: makeWebPosDevicePayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPD-03] @smoke Given empty request body, when web POS device creation attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webpos`, {
        headers: authHeaders(),
        data: {},
      });
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WPD-04] @smoke Given valid device payload, when submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(`${API_BASE}/v1/webpos`, {
        headers: headersWithInvalidToken(),
        data: makeWebPosDevicePayload(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPD-05] @extended Given read-only scoped token, when creating web POS device, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(`${API_BASE}/v1/webpos`, {
        headers: headersWithReadOnlyToken(),
        data: makeWebPosDevicePayload(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WPD-06] @extended Given throttled environment, when creating web POS device, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.post(`${API_BASE}/v1/webpos`, {
        headers: authHeaders(),
        data: makeWebPosDevicePayload(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/webpos/:webpos_device_id ====

test.describe('GET /v1/webpos/:webpos_device_id', () => {
  test(
    '[WPDF-01] @smoke Given newly created web POS device, when fetched by ID, then returns 200 with matching device',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webpos`, {
        headers: authHeaders(),
        data: makeWebPosDevicePayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const deviceId = created.id;

      const start = Date.now();
      const response = await request.get(`${API_BASE}/v1/webpos/${deviceId}`, {
        headers: authHeaders(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webpos-device-response.json');
      const typedBody = body as { id: string };
      expect(typedBody.id).toBe(deviceId);
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WPDF-02] @smoke Given non-existent device ID, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webpos/non-existent-id-99999`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WPDF-03] @smoke Given device ID, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webpos/some-device-id`, {
        headers: headersWithoutAuth(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPDF-04] @smoke Given device ID, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/v1/webpos/some-device-id`, {
        headers: headersWithInvalidToken(),
      });
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPDF-05] @extended Given read-only scoped token, when fetching web POS device by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(`${API_BASE}/v1/webpos/some-device-id`, {
        headers: headersWithReadOnlyToken(),
      });
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WPDF-06] @extended Given throttled environment, when fetching web POS device by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(`${API_BASE}/v1/webpos/some-device-id`, {
        headers: authHeaders(),
      });
      expect(response.status()).toBe(429);
    },
  );
});

// ==== POST /v1/webpos/:webpos_device_id/payments ====

test.describe('POST /v1/webpos/:webpos_device_id/payments', () => {
  test(
    '[WPP-01] @smoke Given existing web POS device, when payment created with authorized credentials, then returns 201 with payment details',
    async ({ request }) => {
      const createResp = await request.post(`${API_BASE}/v1/webpos`, {
        headers: authHeaders(),
        data: makeWebPosDevicePayload(),
      });
      expect(createResp.status()).toBe(201);
      const created = await createResp.json() as { id: string };
      const deviceId = created.id;

      const start = Date.now();
      const response = await request.post(`${API_BASE}/v1/webpos/${deviceId}/payments`, {
        headers: authHeaders(),
        data: makeWebPosPaymentPayload(),
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(201);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webpos-payment-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WPP-02] @smoke Given device ID, when payment submitted without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webpos/some-device-id/payments`,
        {
          headers: headersWithoutAuth(),
          data: makeWebPosPaymentPayload(),
        },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPP-03] @smoke Given non-existent device ID, when payment creation attempted, then returns 404 not found',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webpos/non-existent-id-99999/payments`,
        {
          headers: authHeaders(),
          data: makeWebPosPaymentPayload(),
        },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WPP-04] @smoke Given empty request body, when web POS payment creation attempted, then returns 400 bad request',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webpos/some-device-id/payments`,
        {
          headers: authHeaders(),
          data: {},
        },
      );
      expect(response.status()).toBe(400);
    },
  );

  test(
    '[WPP-05] @smoke Given device ID, when payment submitted with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.post(
        `${API_BASE}/v1/webpos/some-device-id/payments`,
        {
          headers: headersWithInvalidToken(),
          data: makeWebPosPaymentPayload(),
        },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPP-06] @extended Given read-only scoped token, when creating web POS payment, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.post(
        `${API_BASE}/v1/webpos/some-device-id/payments`,
        {
          headers: headersWithReadOnlyToken(),
          data: makeWebPosPaymentPayload(),
        },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WPP-07] @extended Given throttled environment, when creating web POS payment, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.post(
        `${API_BASE}/v1/webpos/some-device-id/payments`,
        {
          headers: authHeaders(),
          data: makeWebPosPaymentPayload(),
        },
      );
      expect(response.status()).toBe(429);
    },
  );
});

// ==== GET /v1/webpos/:webpos_device_id/payments/:payment_id ====

test.describe('GET /v1/webpos/:webpos_device_id/payments/:payment_id', () => {
  test(
    '[WPPF-01] @extended Given existing web POS device and payment, when payment fetched by ID, then returns 200',
    { tag: ['@extended'] },
    async ({ request }) => {
      test.skip(
        !EXISTING_WEBPOS_DEVICE_ID,
        'Set EXISTING_WEBPOS_DEVICE_ID in .env to enable — requires a known device with payment',
      );
      const EXISTING_PAYMENT_ID = process.env.EXISTING_PAYMENT_ID;
      test.skip(!EXISTING_PAYMENT_ID, 'Set EXISTING_PAYMENT_ID in .env to enable');

      const start = Date.now();
      const response = await request.get(
        `${API_BASE}/v1/webpos/${EXISTING_WEBPOS_DEVICE_ID}/payments/${EXISTING_PAYMENT_ID}`,
        { headers: authHeaders() },
      );
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body: unknown = await response.json();
      validateSchema(body, 'webpos-payment-response.json');
      expect(duration).toBeLessThan(5000);
    },
  );

  test(
    '[WPPF-02] @smoke Given non-existent device and payment IDs, when fetched, then returns 404 not found',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webpos/non-existent-device/payments/non-existent-payment`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(404);
    },
  );

  test(
    '[WPPF-03] @smoke Given device and payment IDs, when fetched without authorization, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webpos/some-device-id/payments/some-payment-id`,
        { headers: headersWithoutAuth() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPPF-04] @smoke Given device and payment IDs, when fetched with invalid token, then returns 401 unauthorized',
    async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/v1/webpos/some-device-id/payments/some-payment-id`,
        { headers: headersWithInvalidToken() },
      );
      expect(response.status()).toBe(401);
    },
  );

  test(
    '[WPPF-05] @extended Given read-only scoped token, when fetching web POS payment by ID, then returns 403 forbidden',
    async ({ request }) => {
      test.skip(!process.env.API_TOKEN_READ_ONLY, 'Set API_TOKEN_READ_ONLY in .env to enable — requires scoped token');
      const response = await request.get(
        `${API_BASE}/v1/webpos/some-device-id/payments/some-payment-id`,
        { headers: headersWithReadOnlyToken() },
      );
      expect(response.status()).toBe(403);
    },
  );

  test(
    '[WPPF-06] @extended Given throttled environment, when fetching web POS payment by ID, then returns 429 too many requests',
    async ({ request }) => {
      test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');
      const response = await request.get(
        `${API_BASE}/v1/webpos/some-device-id/payments/some-payment-id`,
        { headers: authHeaders() },
      );
      expect(response.status()).toBe(429);
    },
  );
});
