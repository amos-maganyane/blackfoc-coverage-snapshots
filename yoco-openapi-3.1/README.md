# Yoco API Test Suite

Playwright API tests for the Yoco API.

## Prerequisites

- Node.js 18+
- `npm install`
- Copy `.env.example` to `.env` and fill in values

## Running Tests

```bash
npm run test:smoke          # Smoke tests only — zero-setup green run (CI default)
npm test                    # All tests (smoke + extended)
npm run test:extended       # Extended tests only (needs extra env vars)
npx playwright test --grep CA   # Filter by Capital tests
npx playwright show-report  # Open HTML report
```

## Environment Variables

### REQUIRED

| Variable | Description |
|----------|-------------|
| `API_BASE` | Base URL of the API (e.g. `https://api.yoco.com`) |
| `API_TOKEN` | Bearer token for authentication |

### OPTIONAL

| Variable | Description | Default |
|----------|-------------|---------|
| `API_TOKEN_READ_ONLY` | Restricted-scope token for 403 forbidden tests | — |
| `API_TRIGGER_RATE_LIMIT` | Set to `true` to enable 429 rate-limit tests (requires throttleable environment) | — |

### ADVANCED

| Variable | Description |
|----------|-------------|
| `CI` | Set to `true` in CI environments — enables retries and stricter config |


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
