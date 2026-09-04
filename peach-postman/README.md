# Peach Payments API Test Suite

Playwright API tests for Peach Payments — covering Checkout, Payment Links, Payments, Payouts, and Recon APIs.

## Prerequisites

- Node.js 18+
- `npm install`
- Copy `.env.example` to `.env` and fill in required values

## Running Tests

```bash
npm run test:smoke        # Smoke tests only — zero-setup green run (CI default)
npm test                  # All tests (smoke + extended)
npm run test:extended     # Extended tests only (needs extra env vars)
npx playwright test --grep CO   # Filter Checkout v1 tests
npx playwright test --grep V2   # Filter Checkout v2 tests
npx playwright test --grep PO   # Filter Payouts tests
npx playwright test --grep RC   # Filter Recon tests
```

## Reports

### HTML (built-in)

```bash
npm run test:report       # Open HTML report after test run
```

### Allure

```bash
npm run allure:generate   # Generate Allure report from allure-results/
npm run allure:open       # Open generated report in browser
npm run allure:serve      # One-shot: generate + serve (no prior generate needed)
```

Allure results are written to `allure-results/` on every test run.

## Environment Variables

### REQUIRED

| Variable | Description |
|----------|-------------|
| `API_BASE` | Base URL of the Peach Payments API (e.g. `https://api.peachpayments.com`) |
| `API_TOKEN` | Bearer token for OAuth2-protected endpoints |

### OPTIONAL — enables additional tests when set

| Variable | Description |
|----------|-------------|
| `ENTITY_ID` | Peach entity ID for checkout and payment link tests |
| `MERCHANT_ID` | Merchant ID for payouts, BANV, balance, and recon tests |
| `CHECKOUT_ENTITY_ID` | Entity ID for direct checkout auth parameters |
| `CHECKOUT_SIGNATURE` | HMAC signature for direct checkout requests |
| `CHECKOUT_USER_ID` | User ID for direct checkout auth |
| `CHECKOUT_PASSWORD` | Password for direct checkout auth |
| `OAUTH_CLIENT_ID` | OAuth2 client ID for `/api/oauth/token` tests |
| `OAUTH_CLIENT_SECRET` | OAuth2 client secret |
| `OAUTH_MERCHANT_ID` | Merchant ID for OAuth2 token requests |

### ADVANCED — opt-in extended tests

| Variable | Description |
|----------|-------------|
| `EXISTING_PAYMENT_ID` | Pre-existing payment link ID |
| `EXISTING_FILE_ID` | File ID attached to `EXISTING_PAYMENT_ID` |
| `EXISTING_BATCH_ID` | Pre-existing batch ID with error files |
| `EXISTING_TRANSACTION_ID` | Pre-existing refundable transaction ID |
| `EXISTING_PAYOUT_ID` | Pre-existing payout request ID |
| `EXISTING_BANV_ID` | Pre-existing bank verification ID |
| `CI` | Set to `true` in CI — enables retries and stricter worker limits |

