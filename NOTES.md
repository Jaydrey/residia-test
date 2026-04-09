# Developer Notes

## Approach

I used Page Object Model to keep test logic separate from locators. Each page class owns its own selectors and interactions; the test specs read like a user story.

Test slices go from broad to narrow: smoke confirms the app is reachable, the core workflow test walks the full lifecycle end-to-end, and edge cases probe failure paths. This ordering means a broken deploy fails fast on smoke before wasting time on the longer tests.

Requests are created with a timestamped title. The app is shared across all candidates running tests simultaneously, so without a unique identifier the dashboard search becomes unreliable. Timestamping is the simplest isolation strategy that doesn't require a dedicated test database.

## Key Decisions

**Playwright over Cypress.** The core workflow test requires two browser contexts running concurrently, one for the requester and one for the operator. Cypress runs in a single browser context by default and makes multi-user orchestration awkward. Playwright handles this cleanly with `browser.newContext()`.

**TypeScript.** Caught several locator and type errors before running a single test. Not strictly necessary for a take-home, but the feedback loop is fast enough that it pays for itself.

**Async strategy for AI analysis.** The operator triggers an AI analysis step that takes a variable amount of time. I use `expect(locator).toHaveAttribute('data-status', status, { timeout: 60000 })` and let Playwright's built-in retry handle the wait. No polling loops, no `waitForTimeout`. The reason I check the `data-status` attribute rather than visible text is that the attribute value uses underscored keys (`ready_for_review`) while the rendered text has spaces (`ready for review`). Using `toContainText` would require knowing the display format; using `toHaveAttribute` is exact and unambiguous.

**Modal confirm workaround.** The app's confirm dialogs are not standard `<dialog>` elements or `window.confirm` calls. They are CSS-rendered divs. Playwright's visibility check returns false for them even when they are visible on screen, so a standard `.click()` silently does nothing. I worked around this with `waitForFunction` polling the element's bounding rect for a non-zero height, then `evaluate` to call `.click()` directly on the DOM node. It is not elegant, but it is stable.

**Removed the `submitted` status assertion.** The request transitions from `submitted` to `processing` almost instantly once an operator exists. I could not reliably assert the intermediate state without either slowing the test down with a sleep or introducing a race condition. The assertion was not load-bearing for the lifecycle validation, so I removed it.

## What Was Hard

The modal interaction was the biggest time sink. The first attempt was a standard `.click()` which returned no error but also did not advance the workflow. It took DOM inspection to understand that the modal was CSS-controlled and Playwright's visibility detection could not see it. Once I understood the mechanism the fix was straightforward, but diagnosing it took time.

Login errors are rendered as plain `div` elements with no ARIA role. My first locator was `getByRole('alert')`, which found nothing. I had to inspect the DOM and switch to a scoped `locator('div').filter({ hasText: ... })`. In a production codebase I would file an accessibility ticket for this. A login error is exactly the kind of feedback that screen readers need to announce.

The shared environment also added friction I did not anticipate. Early runs would pick up other candidates' requests when searching the dashboard. The timestamped title solved it, but it was a non-obvious problem the first time tests started returning wrong data.

## What I Would Improve With More Time

- CI with GitHub Actions, running tests on every push
- Multi-environment config so `BASE_URL` can point to staging or local without editing `.env`
- Parallel test execution with worker-level browser context isolation
- HTML report generation with screenshots on failure
- Visual regression snapshots for key UI states
- API contract tests (Pact) alongside the E2E layer
