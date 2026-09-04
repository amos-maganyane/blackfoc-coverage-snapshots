# Peach Payments Promptv6 Playwright API Test Suite

Generated Playwright API tests for this API surface.

## Quick start

```bash
cp .env.example .env
npm install
npm run test:smoke
```

## Available scripts

```bash
npm test
npm run test:smoke
npm run test:extended
npm run test:report
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `API_BASE` | Yes | Used by generated tests. |
| `API_TOKEN` | Yes | Used by generated tests. |
| `CI` | Optional | Used by generated tests. |

## Test structure

- `tests/api.spec.ts`
- `tests/batch.spec.ts`
- `tests/links.spec.ts`
- `tests/payments.spec.ts`
- `tests/v1.spec.ts`
- `tests/v2.spec.ts`
- `tests/helpers/schema-validator.ts`
- `tests/fixtures/schemas/*.json`

