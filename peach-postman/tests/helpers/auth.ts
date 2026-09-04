import { randomUUID } from 'crypto';

const AUTH_TOKEN = process.env.API_TOKEN!;

export function baseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export function authHeaders(): Record<string, string> {
  return { ...baseHeaders(), 'Authorization': `Bearer ${AUTH_TOKEN}` };
}

export function headersWithoutAuth(): Record<string, string> {
  return baseHeaders();
}

export function headersWithInvalidToken(): Record<string, string> {
  return { ...baseHeaders(), 'Authorization': 'Bearer invalid-token-value-99999' };
}

export function oauthFormHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  };
}

export function checkoutAuthParams(): Record<string, string> {
  return {
    entityId: process.env.CHECKOUT_ENTITY_ID ?? 'test-entity-id',
    signature: process.env.CHECKOUT_SIGNATURE ?? 'test-signature',
  };
}
