import { randomUUID } from 'crypto';

function baseHeaders(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Absa-ClientInteractionId': `test-${randomUUID()}`,
    'X-Absa-Nonce': randomUUID(),
    'X-Absa-Initiating-UserId': process.env.API_USER_ID ?? '', // Optional header value when env var is provided
    ...overrides,
  };
}

export function authHeaders(overrides: Record<string, string> = {}): Record<string, string> {
  const token = process.env.API_TOKEN;
  if (!token) {
    throw new Error('API_TOKEN env var is required');
  }

  return baseHeaders({ Authorization: `Bearer ${token}`, ...overrides });
}

export function headersWithoutAuth(overrides: Record<string, string> = {}): Record<string, string> {
  return baseHeaders(overrides);
}

export function headersWithInvalidToken(overrides: Record<string, string> = {}): Record<string, string> {
  return baseHeaders({ Authorization: 'Bearer invalid-expired-token-00000', ...overrides });
}
