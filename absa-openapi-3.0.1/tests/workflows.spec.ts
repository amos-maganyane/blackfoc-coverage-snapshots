import { expect, test } from '@playwright/test';
import { authHeaders } from './helpers/auth';
import { createConsent, createPayment, getDataBoolean, getDataString, parseJsonRecord } from './helpers/api-helpers';

test.describe('Domestic payment workflows', () => {
  test('[WF-01] @smoke Given newly created consent, when status retrieved, then ConsentId matches the created consent', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const response = await request.get(`/domestic-payment-consents/${consentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(getDataString(body, 'ConsentId')).toBe(consentId);
  });

  test('[WF-02] @smoke Given newly created consent, when funds confirmation retrieved, then FundsAvailable is returned as a boolean', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const response = await request.get(`/domestic-payment-consents/${consentId}/funds-confirmation`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(typeof getDataBoolean(body, 'FundsAvailable')).toBe('boolean');
  });

  test('[WF-03] @smoke Given newly created consent, when payment initiated with ConsentId, then returns a DomesticPaymentId linked to the consent', async ({ request }) => {
    const { consentId } = await createConsent(request);
    const { body } = await createPayment(request, consentId);

    expect(getDataString(body, 'ConsentId')).toBe(consentId);
    expect(getDataString(body, 'DomesticPaymentId')).not.toBe('');
  });

  test('[WF-04] @smoke Given newly created payment, when status retrieved, then DomesticPaymentId matches the created payment', async ({ request }) => {
    const { domesticPaymentId } = await createPayment(request);
    const response = await request.get(`/domestic-payments/${domesticPaymentId}`, {
      headers: authHeaders(),
    });

    expect(response.status()).toBe(200);

    const body = await parseJsonRecord(response);
    expect(getDataString(body, 'DomesticPaymentId')).toBe(domesticPaymentId);
  });
});
