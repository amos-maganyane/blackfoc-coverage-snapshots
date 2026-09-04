import { randomUUID } from 'crypto';

export function uniqueId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function makeCheckoutPayload() {
  return {
    amount: 2000,
    currency: 'ZAR',
    cancelUrl: 'https://example.com/cancel',
    successUrl: 'https://example.com/success',
    failureUrl: 'https://example.com/failure',
    metadata: {
      orderId: uniqueId('ORD'),
    },
  };
}

export function makeRefundPayload() {
  return {
    amount: 1000,
    reason: 'requested_by_customer',
  };
}

export function makeWebhookPayload() {
  return {
    url: `https://webhook.example.com/${uniqueId('hook')}`,
    event: 'payment.succeeded',
  };
}

export function makeWebhookSubscriptionPayload() {
  return {
    url: `https://webhook.example.com/${uniqueId('sub')}`,
    events: ['payment.created', 'payment.refunded'],
  };
}

export function makePaymentLinkPayload() {
  return {
    amount: 5000,
    currency: 'ZAR',
    name: `Test Payment ${uniqueId('PLN')}`,
    description: 'Test payment link',
  };
}

export function makeWebPosDevicePayload() {
  return {
    name: `Test POS ${uniqueId('POS')}`,
  };
}

export function makeWebPosPaymentPayload() {
  return {
    amount: 1500,
    currency: 'ZAR',
    tipAmount: 0,
  };
}

export function makeOAuthTokenPayload() {
  return {
    grant_type: 'client_credentials',
    client_id: process.env.OAUTH_CLIENT_ID ?? 'test-client-id',
    client_secret: process.env.OAUTH_CLIENT_SECRET ?? 'test-client-secret',
    scope: 'read:payments',
  };
}
