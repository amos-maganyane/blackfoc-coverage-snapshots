import { expect, test } from '@playwright/test';
import { authHeaders, headersWithInvalidToken, headersWithoutAuth } from './helpers/auth';
import { readOnlyTokenOrSkip } from './helpers/api-helpers';
import { validateSchema } from './helpers/schema-validator';
import { makeConsentPayload } from './helpers/test-data';

test.describe('POST /domestic-payment-consents', () => {
  test('[DC-01] @smoke Given valid RTC payment consent, when created with authorized credentials, then returns 200 with ConsentId and AwaitingAuthorisation status', async ({ request }) => {
    const payload = makeConsentPayload();
    const start = Date.now();
    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders(),
      data: payload,
    });
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');

    const body: unknown = await response.json();
    validateSchema(body, 'consent-create-response.json');
    expect(duration).toBeLessThan(5000);
  });

  test('[DC-02] @smoke Given valid payment consent, when submitted without authorization header, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post('/domestic-payment-consents', {
      headers: headersWithoutAuth(),
      data: makeConsentPayload(),
    });

    expect(response.status()).toBe(401);
  });

  test('[DC-03] @smoke Given valid payment consent, when submitted with expired bearer token, then returns 401 unauthorized', async ({ request }) => {
    const response = await request.post('/domestic-payment-consents', {
      headers: headersWithInvalidToken(),
      data: makeConsentPayload(),
    });

    expect(response.status()).toBe(401);
  });

  test('[DC-04] @smoke Given empty request body, when consent creation attempted, then returns 400 bad request', async ({ request }) => {
    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders(),
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('[DC-05] @smoke Given request body missing required Data field, when consent creation attempted, then returns 400 bad request', async ({ request }) => {
    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders(),
      data: {
        Risk: {
          MerchantCategoryCode: '5411',
          PaymentContextCode: 'BillPayment',
        },
      },
    });

    expect(response.status()).toBe(400);
  });

  test('[DC-06] @smoke Given request body missing required Risk field, when consent creation attempted, then returns 400 bad request', async ({ request }) => {
    const payload = makeConsentPayload();
    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders(),
      data: {
        Data: payload.Data,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('[DC-07] @extended Given read-only scoped credentials, when consent creation attempted, then returns 403 forbidden', async ({ request }) => {
    const readOnlyToken = readOnlyTokenOrSkip();
    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders({ Authorization: `Bearer ${readOnlyToken}` }),
      data: makeConsentPayload(),
    });

    expect(response.status()).toBe(403);
  });

  test('[DC-08] @smoke Given previously used nonce, when consent creation replayed, then returns 412 precondition failed', async ({ request }) => {
    const payload = makeConsentPayload();
    const replayedNonce = 'fixed-replay-nonce-consent-create';

    const firstResponse = await request.post('/domestic-payment-consents', {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
      data: payload,
    });

    expect(firstResponse.status()).toBe(200);

    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders({ 'X-Absa-Nonce': replayedNonce }),
      data: payload,
    });

    expect(response.status()).toBe(412);
  });

  test('[DC-09] @extended Given rate-limited environment, when consent creation attempted, then returns 429 too many requests', async ({ request }) => {
    test.skip(!process.env.API_TRIGGER_RATE_LIMIT, 'Skipped: set API_TRIGGER_RATE_LIMIT=true to execute rate limit test');

    const response = await request.post('/domestic-payment-consents', {
      headers: authHeaders({ 'X-Absa-ClientInteractionId': 'rate-limit-trigger-001' }),
      data: makeConsentPayload(),
    });

    expect(response.status()).toBe(429);
  });

});
