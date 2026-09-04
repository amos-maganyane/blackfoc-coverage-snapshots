import { randomUUID } from 'crypto';

export function uniqueId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function makeCheckoutPayload(): Record<string, unknown> {
  return {
    'authentication.entityId': process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user-id',
    'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
    'amount': '10.00',
    'currency': 'ZAR',
    'paymentType': 'DB',
    'merchantTransactionId': uniqueId('TXN'),
  };
}

export function makeCheckoutValidatePayload(): Record<string, unknown> {
  return {
    'authentication.entityId': process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    'signature': process.env.CHECKOUT_SIGNATURE ?? 'test-signature',
    'merchantTransactionId': uniqueId('TXN'),
    'amount': '10.00',
    'currency': 'ZAR',
  };
}

export function makeMerchantSpecsPayload(): Record<string, unknown> {
  return {
    'authentication.entityId': process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user-id',
    'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
    'currency': 'ZAR',
  };
}

export function makeV2CheckoutPayload(): Record<string, unknown> {
  return {
    'authentication.entityId': process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user-id',
    'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
    'amount': '10.00',
    'currency': 'ZAR',
    'nonce': uniqueId('NONCE'),
    'shopperResultUrl': 'https://example.com/result',
  };
}

export function makeOAuthTokenPayload(): Record<string, unknown> {
  return {
    clientId: process.env.OAUTH_CLIENT_ID ?? 'test-client-id',
    clientSecret: process.env.OAUTH_CLIENT_SECRET ?? 'test-client-secret',
    merchantId: process.env.OAUTH_MERCHANT_ID ?? 'test-merchant-id',
    grantType: 'client_credentials',
  };
}

export function makePaymentLinkPayload(): Record<string, unknown> {
  return {
    amount: '50.00',
    currency: 'ZAR',
    merchantTransactionId: uniqueId('LINK'),
    description: 'Test payment link',
    customer: {
      email: `test-${uniqueId('USR').toLowerCase()}@example.com`,
    },
  };
}

export function makePaymentPayload(): Record<string, unknown> {
  return {
    'authentication.entityId': process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user-id',
    'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
    'amount': '10.00',
    'currency': 'ZAR',
    'paymentType': 'DB',
    'merchantTransactionId': uniqueId('TXN'),
    'card.number': '4200000000000000',
    'card.holder': 'Test User',
    'card.expiryMonth': '12',
    'card.expiryYear': '2030',
    'card.cvv': '123',
  };
}

export function makeRefundPayload(): Record<string, unknown> {
  return {
    'authentication.entityId': process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    'authentication.userId': process.env.CHECKOUT_USER_ID ?? 'test-user-id',
    'authentication.password': process.env.CHECKOUT_PASSWORD ?? 'test-password',
    'amount': '5.00',
    'currency': 'ZAR',
    'paymentType': 'RF',
  };
}

export function makePayoutPayload(): Record<string, unknown> {
  return {
    amount: '100.00',
    currency: 'ZAR',
    merchantTransactionId: uniqueId('POUT'),
    recipient: {
      bankAccount: {
        accountNumber: '1234567890',
        bankCode: '632005',
        accountType: 'current',
      },
      firstName: 'Test',
      lastName: 'Recipient',
    },
  };
}

export function makeBanvPayload(): Record<string, unknown> {
  return {
    bankAccount: {
      accountNumber: '1234567890',
      bankCode: '632005',
      accountType: 'current',
    },
    accountHolder: {
      firstName: 'Test',
      lastName: 'Holder',
      idNumber: '8001015009087',
    },
  };
}

export function makeBatchPayload(): Record<string, unknown> {
  return {
    merchantTransactionId: uniqueId('BATCH'),
    currency: 'ZAR',
    payments: [
      {
        amount: '25.00',
        merchantTransactionId: uniqueId('BPAY'),
        recipient: {
          email: `batch-${uniqueId('USR').toLowerCase()}@example.com`,
        },
      },
    ],
  };
}
