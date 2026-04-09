# Residia Test: E2E Test Suite

Playwright-based end-to-end test suite for a workflow application. Covers login, full request lifecycle across three roles, and boundary/failure cases.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
git clone <repo-url>
cd residia-test
npm install
npx playwright install chromium
```

Create a `.env` file in the project root:

```
BASE_URL=https://automation-engineer-test.onrender.com
```

## Running Tests

```bash
npm run test          # headless, all specs
npm run test:headed   # browser visible
npm run test:debug    # step through with Playwright inspector
```

Note: the first run after inactivity may take 30-60 seconds while the Render instance wakes up. That delay is expected and not a test failure.

## Project Structure

```
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env
├── src/
│   └── pages/
│       ├── login.page.ts
│       ├── dashboard.page.ts
│       ├── new-request.page.ts
│       └── request-detail.page.ts
├── tests/
│   ├── test-data.ts
│   ├── smoke.spec.ts
│   ├── core-workflow.spec.ts
│   └── edge-cases.spec.ts
```

## What the Tests Validate

**smoke.spec.ts** — login succeeds and the dashboard loads. Baseline check that the app is reachable and auth works.

**core-workflow.spec.ts** — full request lifecycle across three roles. Alice (requester) submits a request, waits for AI analysis to complete, Bob (reviewer) approves it, and Charlie (claimer) claims it. Verifies each status transition: submitted, ai_analyzing, ready_for_review, approved, claimed.

**edge-cases.spec.ts** — invalid login shows an error and stays on the login page. Role boundary test confirms that Alice (requester) cannot see Approve or Claim buttons on her own request.
