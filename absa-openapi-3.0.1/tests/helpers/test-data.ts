import { randomUUID } from 'crypto';
import validConsent from '../fixtures/valid-consent.json';
import validPayment from '../fixtures/valid-payment.json';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type ConsentPayload = typeof validConsent;
export type PaymentPayload = typeof validPayment;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeDeep(target: Record<string, unknown>, overrides: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      continue;
    }

    const current = target[key];
    if (isRecord(current) && isRecord(value)) {
      mergeDeep(current, value);
      continue;
    }

    target[key] = value;
  }
}

function applyOverrides<T extends Record<string, unknown>>(target: T, overrides: DeepPartial<T>): T {
  if (!isRecord(overrides)) {
    return target;
  }

  mergeDeep(target, overrides);
  return target;
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function makeConsentPayload(overrides: DeepPartial<ConsentPayload> = {}): ConsentPayload {
  const base = structuredClone(validConsent);
  base.Data.Initiation.InstructionIdentification = uniqueId('INSTR');
  base.Data.Initiation.EndToEndIdentification = uniqueId('E2E');
  return applyOverrides(base, overrides);
}

export function makePaymentPayload(
  consentId: string,
  overrides: DeepPartial<PaymentPayload> = {},
): PaymentPayload {
  const base = structuredClone(validPayment);
  base.Data.ConsentId = consentId;
  base.Data.Initiation.InstructionIdentification = uniqueId('INSTR');
  base.Data.Initiation.EndToEndIdentification = uniqueId('E2E');
  return applyOverrides(base, overrides);
}
