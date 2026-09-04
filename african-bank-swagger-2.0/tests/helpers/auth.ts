const AUTH_TOKEN = process.env.API_TOKEN!;
const READ_ONLY_TOKEN = process.env.API_TOKEN_READ_ONLY;

export const AGENT_ID = process.env.AGENT_ID ?? '';

export function baseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Agent-Id': AGENT_ID,
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
  return { ...baseHeaders(), 'Authorization': `Bearer ${READ_ONLY_TOKEN ?? 'read-only-token'}` };
}

export { READ_ONLY_TOKEN };
