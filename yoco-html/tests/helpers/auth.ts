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
  return { ...baseHeaders(), 'Authorization': 'Bearer invalid-token-value' };
}

export function headersWithReadOnlyToken(): Record<string, string> {
  return { ...baseHeaders(), 'Authorization': `Bearer ${process.env.API_TOKEN_READ_ONLY}` };
}

export function checkoutAuthHeaders(secretKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${secretKey}`,
  };
}
