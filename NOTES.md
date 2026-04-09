# Developer Notes

## Approach

I used Page Object Model to keep test logic separate from locators. Each page class owns its own selectors and interactions; the test specs read like a user story.

Before writing any page object, I opened DevTools on each page of the app and inspected the HTML structure. I checked which elements had `data-testid` attributes, tried CSS selectors and XPath queries in the Elements panel to make sure I was targeting the right nodes, and only then wrote the locators in code. This saved a lot of debugging later because every selector was validated against the real DOM before it went into a page object.

Test slices go from broad to narrow: smoke confirms the app is reachable, the core workflow test walks the full lifecycle end-to-end, and edge cases probe failure paths. This ordering means a broken deploy fails fast on smoke before wasting time on the longer tests.

Requests are created with a timestamped title. The app is shared across all candidates running tests simultaneously, so without a unique identifier the dashboard search becomes unreliable. Timestamping is the simplest isolation strategy that doesn't require a dedicated test database.

## Key Decisions

**Playwright over Cypress.** The core workflow test switches between three user roles (Alice, Bob, Charlie) within a single test. Playwright's architecture makes this straightforward, and if I needed to extend this to run roles in parallel contexts, `browser.newContext()` would handle it cleanly. Cypress runs in a single browser context and makes multi-user orchestration awkward.

**TypeScript.** Caught several locator and type errors before running a single test. Not strictly necessary for a take-home, but the feedback loop is fast enough that it pays for itself.

**Async strategy for AI analysis.** The AI analysis step takes a variable amount of time. I use `expect(locator).toHaveAttribute('data-status', status, { timeout: 90_000 })` and let Playwright's built-in retry handle the wait. No polling loops, no `waitForTimeout`. I initially tried matching visible text with `toContainText`, but when I inspected the status badge in DevTools I noticed the `data-status` attribute uses underscored keys (`ready_for_review`) while the rendered text shows spaces (`ready for review`). Switching to `toHaveAttribute` was more reliable because it matches the exact internal value rather than whatever the CSS decides to display.

**Modal confirm workaround.** When I clicked the Approve button, a confirmation dialog appeared on screen but Playwright's `.click()` on the Confirm button silently did nothing. I opened DevTools and saw the modal was a CSS-rendered div, not a native `<dialog>` or `window.confirm`. Playwright's visibility check was returning false even though the button was clearly visible. I checked the element's computed styles and bounding rect in the console, and the rect had valid dimensions. So I wrote a workaround: `waitForFunction` polls until the confirm button has a non-zero bounding rect, then `evaluate` calls `.click()` directly on the DOM node. Not elegant, but stable.

**Removed the `submitted` status assertion.** The request transitions from `submitted` to `ai_analyzing` almost instantly. I could not reliably assert the intermediate state without either slowing the test down with a sleep or introducing a race condition. The assertion was not load-bearing for the lifecycle validation, so I dropped it.

## What Was Hard

The modal interaction was the biggest time sink. The Approve and Claim buttons both trigger a confirmation dialog, and both times Playwright reported the confirm button as hidden. I spent time in DevTools comparing the element's CSS visibility properties, checking `getComputedStyle`, and testing different selector strategies before landing on the bounding rect approach. Once I understood the pattern the fix was quick, but figuring out why `.click()` was silently failing took real debugging.

Login errors tripped me up initially. I assumed the app would use `role="alert"` for error messages, which is the accessibility best practice. When `getByRole('alert')` matched nothing, I opened DevTools and saw the error was a plain `<div>` with no ARIA attributes. I tried a few CSS selectors in the console to find a reliable match, then settled on scoping to the login page root and filtering by error-related text. In a production codebase I would file an accessibility ticket for this, because a login error is exactly the kind of feedback that screen readers need to announce.

The shared environment also added friction I did not anticipate. Early runs would pick up other candidates' requests when searching the dashboard. The timestamped title solved it, but it was a non-obvious problem the first time tests started returning unexpected data.

## What I Would Improve With More Time

- CI with GitHub Actions, running tests on every push
- Multi-environment config so `BASE_URL` can point to staging or local without editing `.env`
- Parallel test execution with worker-level browser context isolation
- HTML report generation with screenshots on failure
- Visual regression snapshots for key UI states
- API contract tests (Pact) alongside the E2E layer
