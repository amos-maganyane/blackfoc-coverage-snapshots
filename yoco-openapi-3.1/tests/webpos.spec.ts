import { test, expect } from '@playwright/test';
import { authHeaders, headersWithoutAuth, headersWithInvalidToken, readOnlyHeaders } from './helpers/auth';
import { validateSchema } from './helpers/schema-validator';
import { makeWebPOSDevicePayload, makeWebPOSPaymentPayload } from './helpers/test-data';

const API_BASE = process.env.API_BASE!;

// ============================
// POST /v1/webpos/
// ============================
test.describe('POST /v1/webpos/', () => {

  test('[WP-01] @smoke Given valid Web POS device payload, when created with authorized credentials, then returns 201 with device', async ({ request }) => {
    const start = Date.now();
    const response = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: authHeaders(),
      data: makeWebPOSDevicePayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'webpos-device-response.json');
    expect(body.id).toBeDefined();
    expect(duration).toBeLessThan(5000);
  });

  test('[WP-02] @smoke Given empty request body, when creating Web POS device, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-03] @smoke Given no authorization, when creating Web POS device, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: headersWithoutAuth(),
      data: makeWebPOSDevicePayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-04] @smoke Given invalid token, when creating Web POS device, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: headersWithInvalidToken(),
      data: makeWebPOSDevicePayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WP-22] @extended Given read-only scoped credentials, when created with authorized credentials, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: readOnlyHeaders(),
      data: makeWebPOSDevicePayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-23] @extended Given rate-limited environment, when created with authorized credentials, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: authHeaders(),
      data: makeWebPOSDevicePayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/webpos/{webpos_device_id}
// ============================
test.describe('GET /v1/webpos/{webpos_device_id}', () => {

  test('[WP-07] @smoke Given newly created Web POS device, when fetched by ID, then returns 200 with matching device', async ({ request }) => {
    // Self-seed
    const createResp = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: authHeaders(),
      data: makeWebPOSDevicePayload(),
    });
    expect(createResp.status()).toBe(201);
    const created = await createResp.json();
    const deviceId: string = created.id;
    expect(deviceId).toBeDefined();

    const start = Date.now();
    const response = await request.get(`${API_BASE}/v1/webpos/${deviceId}`, {
      headers: authHeaders(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'webpos-device-response.json');
    expect(body.id).toBe(deviceId);
    expect(duration).toBeLessThan(5000);
  });

  test('[WP-08] @smoke Given non-existent Web POS device ID, when fetching device, then returns 404 not found', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000000`, {
      headers: authHeaders(),
    });
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-09] @smoke Given no authorization, when fetching Web POS device by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001`, {
      headers: headersWithoutAuth(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-10] @smoke Given invalid token, when fetching Web POS device by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001`, {
      headers: headersWithInvalidToken(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WP-24] @extended Given read-only scoped credentials, when fetched by ID, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
      data: makeWebPOSDevicePayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-25] @extended Given rate-limited environment, when fetched by ID, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
      data: makeWebPOSDevicePayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// POST /v1/webpos/{webpos_device_id}/payments
// ============================
test.describe('POST /v1/webpos/{webpos_device_id}/payments', () => {

  test('[WP-13] @smoke Given newly created Web POS device and valid payment payload, when payment created, then returns 201', async ({ request }) => {
    // Self-seed device
    const createDeviceResp = await request.post(`${API_BASE}/v1/webpos/`, {
      headers: authHeaders(),
      data: makeWebPOSDevicePayload(),
    });
    expect(createDeviceResp.status()).toBe(201);
    const device = await createDeviceResp.json();
    const deviceId: string = device.id;

    const start = Date.now();
    const response = await request.post(`${API_BASE}/v1/webpos/${deviceId}/payments`, {
      headers: authHeaders(),
      data: makeWebPOSPaymentPayload(),
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    validateSchema(body, 'webpos-payment-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[WP-14] @smoke Given empty request body, when creating Web POS payment, then returns 400 bad request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments`, {
      headers: authHeaders(),
      data: {},
    });
    expect(response.status()).toBe(400);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-15] @smoke Given no authorization, when creating Web POS payment, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments`, {
      headers: headersWithoutAuth(),
      data: makeWebPOSPaymentPayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-16] @smoke Given invalid token, when creating Web POS payment, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments`, {
      headers: headersWithInvalidToken(),
      data: makeWebPOSPaymentPayload(),
    });
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WP-26] @extended Given read-only scoped credentials, when payment created, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.post(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments`, {
      headers: readOnlyHeaders(),
      data: makeWebPOSDevicePayload()
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-27] @extended Given rate-limited environment, when payment created, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.post(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments`, {
      headers: authHeaders(),
      data: makeWebPOSDevicePayload()
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});

// ============================
// GET /v1/webpos/{webpos_device_id}/payments/{payment_id}
// ============================
test.describe('GET /v1/webpos/{webpos_device_id}/payments/{payment_id}', () => {

  test('[WP-19] @smoke Given non-existent Web POS payment ID, when fetching payment, then returns 404 not found', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments/00000000-0000-0000-0000-000000000000`,
      { headers: authHeaders() },
    );
    expect(response.status()).toBe(404);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-20] @smoke Given no authorization, when fetching Web POS payment by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments/00000000-0000-0000-0000-000000000002`,
      { headers: headersWithoutAuth() },
    );
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-21] @smoke Given invalid token, when fetching Web POS payment by ID, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments/00000000-0000-0000-0000-000000000002`,
      { headers: headersWithInvalidToken() },
    );
    expect(response.status()).toBe(401);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });


  test('[WP-28] @extended Given read-only scoped credentials, when fetching payment, then returns 403 forbidden', async ({ request }) => {
    test.skip(!process.env.API_TOKEN_READ_ONLY, 'Skipped: set API_TOKEN_READ_ONLY to a restricted-scope token to execute');

    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments/00000000-0000-0000-0000-000000000001`, {
      headers: readOnlyHeaders(),
    });

    expect(response.status()).toBe(403);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });

  test('[WP-29] @extended Given rate-limited environment, when fetching payment, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true in an environment where this endpoint can be throttled');

    const response = await request.get(`${API_BASE}/v1/webpos/00000000-0000-0000-0000-000000000001/payments/00000000-0000-0000-0000-000000000001`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(429);
    const body: unknown = await response.json();
    validateSchema(body, 'error-response.json');
  });
});
