# ABSA Domestic Payments API Test Suite

Playwright API coverage suite for ABSA Domestic Payments endpoints.

## Prerequisites

- Node.js 18+

## Quick start

```bash
cp .env.example .env
# fill in API_BASE and API_TOKEN in .env
npm install
npx playwright test
```

## Run modes

```bash
npm run test:smoke      # Self-contained tests only (API_BASE + API_TOKEN)
npm run test:extended   # Environment-dependent tests (needs extra env vars)
npm test                # Everything (extended tests auto-skip when env vars absent)
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `API_BASE` | Yes | Base URL for the ABSA Domestic Payments API, for example `https://your-api-base-url/payments/v1`. |
| `API_TOKEN` | Yes | Bearer token used for the default authenticated test paths. |
| `API_TOKEN_READ_ONLY` | Optional | Read-only token used by forbidden-scope (`403`) tests. Those tests skip automatically when unset. |
| `API_USER_ID` | Optional | Value for `X-Absa-Initiating-UserId`. Defaults to empty when unset. |
| `TEST_CONSENT_ID` | Optional | Pre-existing consent ID for optional historical-resource GET coverage. Tests skip automatically when unset. |
| `TEST_PAYMENT_ID` | Optional | Pre-existing payment ID for optional historical-resource GET coverage. Tests skip automatically when unset. |
| `API_TRIGGER_RATE_LIMIT` | Advanced | Enables environment-specific `429` tests. |
| `API_TRIGGER_SERVER_ERROR` | Advanced | Enables environment-specific `500` tests. |
| `API_TRIGGER_GATEWAY_ERROR` | Advanced | Enables environment-specific `502` tests. |

## Default run behavior

With only `API_BASE` and `API_TOKEN` configured, the suite runs self-contained scenarios:

- create consent
- retrieve consent
- confirm funds
- create payment
- retrieve payment
- auth failure coverage
- end-to-end create-and-verify workflows

Tests that require extra infrastructure or pre-existing records are auto-skipped with a clear message explaining which environment variable to set.

## Reports

### HTML (built-in)

```bash
npx playwright show-report
```

### Allure

```bash
npm run allure:generate   # Generate report from allure-results/
npm run allure:open       # Open generated report in browser
npm run allure:serve      # One-shot: generate + serve (no prior generate needed)
```

Allure results are written to `allure-results/` on every test run. The `allure-history.jsonl` file tracks historical trends across runs when present.
