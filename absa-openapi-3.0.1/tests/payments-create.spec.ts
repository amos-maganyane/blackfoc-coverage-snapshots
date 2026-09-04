import { expect, test } from '@playwright/test';
import { authHeaders, headersWithInvalidToken, headersWithoutAuth } from './helpers/auth';
import { createConsent, readOnlyTokenOrSkip } from './helpers/api-helpers';
import { validateSchema } from './helpers/schema-validator';
import { makePaymentPayload } from './helpers/test-data';

test.describe('POST /domestic-payments', () => {
  test('[DP-01] @smoke Given valid consent-backed RTC payment, when payment created with authorized credentials, then returns 200 with DomesticPaymentId linked to ConsentId', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const payload = makePaymentPayload(consentId);
    const start = Date.now();
    const response = await request.post('/domestic-payments', {
      headers: authHeaders(),
      data: payload,
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');

    const body: unknown = await response.json();
    validateSchema(body, 'payment-create-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[DP-02] @smoke Given valid consent-backed payment, when payment submitted without authorization header, then returns 401 unauthorized', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const response = await request.post('/domestic-payments', {
      headers: headersWithoutAuth(),
      data: makePaymentPayload(consentId),
    });

    expect(response.status()).toBe(401);
  });

  test('[DP-03] @smoke Given valid consent-backed payment, when payment submitted with expired bearer token, then returns 401 unauthorized', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const response = await request.post('/domestic-payments', {
      headers: headersWithInvalidToken(),
      data: makePaymentPayload(consentId),
    });

    expect(response.status()).toBe(401);
  });

  test('[DP-04] @smoke Given empty request body, when payment creation attempted, then returns 400 bad request', async ({ request }) => {
    const response = await request.post('/domestic-payments', {
      headers: authHeaders(),
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('[DP-05] @smoke Given request body missing required Data.ConsentId field, when payment creation attempted, then returns 400 bad request', async ({ request }) => {
    const payload = makePaymentPayload('consent-placeholder-for-validation');
    const { ConsentId: _unusedConsentId, ...dataWithoutConsentId } = payload.Data;
    const response = await request.post('/domestic-payments', {
      headers: authHeaders(),
      data: {
        Data: dataWithoutConsentId,
        Risk: payload.Risk,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('[DP-06] @smoke Given request body missing required Risk field, when payment creation attempted, then returns 400 bad request', async ({ request }) => {
    const payload = makePaymentPayload('consent-placeholder-for-validation');
    const response = await request.post('/domestic-payments', {
      headers: authHeaders(),
      data: {
        Data: payload.Data,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('[DP-07] @extended Given read-only scoped credentials, when payment creation attempted, then returns 403 forbidden', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const readOnlyToken = readOnlyTokenOrSkip();
    const response = await request.post('/domestic-payments', {
      headers: authHeaders({ Authorization: `Bearer ${readOnlyToken}` }),
      data: makePaymentPayload(consentId),
    });

    expect(response.status()).toBe(403);
  });

  test('[DP-08] @smoke Given previously used nonce, when payment creation replayed, then returns 412 precondition failed', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const payload = makePaymentPayload(consentId);
    const replayedNonce = 'fixed-replay-nonce-payment-create';

    const firstResponse = await request.post('/domestic-payments', {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
      data: payload,
    });

    expect(firstResponse.status()).toBe(200);

    const response = await request.post('/domestic-payments', {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
      data: payload,
    });

    expect(response.status()).toBe(412);
  });

  test('[DP-09] @extended Given rate-limited environment, when payment creation attempted, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true to execute rate limit test');

    const { consentId } = await createConsent(request);
    const response = await request.post('/domestic-payments', {
      headers: authHeaders(),
      data: makePaymentPayload(consentId),
    });

    expect(response.status()).toBe(429);
  });

});
