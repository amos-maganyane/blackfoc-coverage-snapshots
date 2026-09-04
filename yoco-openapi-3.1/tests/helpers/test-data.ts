import { randomUUID } from 'crypto';

export function uniqueId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function makePaymentLinkPayload(): Record<string, unknown> {
  return {
    amount: 10000,
    currency: 'ZAR',
    description: `Test payment link ${uniqueId('PL')}`,
    cancel_url: 'https://example.com/cancel',
    success_url: 'https://example.com/success',
  };
}

export function makeWebhookSubscriptionPayload(): Record<string, unknown> {
  return {
    url: `https://webhook.site/${uniqueId('WH').toLowerCase()}`,
    events: ['payment.succeeded'],
  };
}

export function makeWebPOSDevicePayload(): Record<string, unknown> {
  return {
    name: `Test POS Device ${uniqueId('POS')}`,
  };
}

export function makeWebPOSPaymentPayload(): Record<string, unknown> {
  return {
    amount: 5000,
    currency: 'ZAR',
  };
}
