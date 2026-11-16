# Evaluation Report: httpbookstoscrapecom-navigate-to-the-nex

**System**: Multi-Agent Pipeline (PO → BA → Dev → Tester → Evaluator)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-05
**Target Application**: Books to Scrape (http://books.toscrape.com) — "Next" pagination

## 1. Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests generated | 24 |
| Tests passed | 23 |
| Tests failed | 1 |
| **Success rate** | **95.83%** |
| Total execution time | 68.34s |

## 2. FR Coverage

| FR | Description | Tests Covering It | Covered? |
|----|-------------|--------------------|----------|
| FR-01 | "Next" pagination control is visible when further pages exist | TC-001-P, TC-002-P, TC-003-F | Yes |
| FR-02 | Clicking "next" navigates to the following page | TC-004-P, TC-005-F, TC-006-F | Yes |
| FR-03 | New set of book items is displayed after navigating to page 2 | TC-007-P, TC-008-F, TC-009-P | Yes |
| FR-04 | Repeated "next" navigation advances sequentially through multiple pages | TC-010-P, TC-011-F, TC-012-P | Yes |
| FR-05 | "Next" control is absent or disabled on the last page | TC-013-P, TC-014-F, TC-015-P | Yes |
| FR-06 | Page indicator reflects current page position | TC-016-P, TC-017-F, TC-018-P | Yes |
| FR-07 | Direct navigation beyond the last page is handled gracefully | TC-019-P, TC-020-F, TC-021-P | Yes |
| FR-08 | Browser back navigation restores the expected prior page | TC-022-P, TC-023-F, TC-024-P | Yes |

**FR coverage**: 8 / 8 requirements covered (100%)

## 3. Fault Detection Capacity

| TC ID | Fault Type | Detected? |
|-------|------------|-----------|
| TC-003-F | state — "next" control present but falsely hidden | Yes |
| TC-005-F | navigation — click leaves URL unchanged | Yes |
| TC-006-F | navigation — rapid double-click skips a page | Yes |
| TC-008-F | state — page 2 renders as duplicate/empty of page 1 | Yes |
| TC-011-F | navigation — sequential "next" clicks revisit a page | Yes |
| TC-014-F | navigation — "previous" control missing on last page | Yes |
| TC-017-F | state — page indicator retains stale page number | Yes |
| TC-020-F | input validation — beyond-last-page silently re-serves last valid page | Yes |
| TC-023-F | state — "next" control left missing/stale after back navigation | Yes |

**Distinct fault types**: 3 (state, navigation, input validation)
**Fault detection rate**: 9 / 9 (100%)

Note: The 15 `-P` suffixed TCs carry Fault Type `n/a` in the TC doc — they verify correct behaviour on the live (non-faulty) site rather than fault detection, so they are excluded from the fault-detection denominator above.

## 4. Individual Test Results

| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | should show a visible "next" control with a non-empty href on page 1 | Positive | Passed | 4128ms |
| TC-002-P | should show a visible "next" control on page 49 | Boundary | Passed | 2228ms |
| TC-003-F | should not render the "next" control as hidden on page 1 | Negative | Passed | 2234ms |
| TC-004-P | should navigate to page 2 when "next" is clicked from page 1 | Positive | Passed | 2973ms |
| TC-005-F | should change the URL after clicking "next" | Negative | Passed | 2345ms |
| TC-006-F | should not skip to page 3 after a rapid double-click on "next" | Boundary | Passed | 1579ms |
| TC-007-P | should display a completely distinct book set on page 2 compared with page 1 | Positive | Passed | 2862ms |
| TC-008-F | should not render page 2 as an empty or identical copy of page 1 | Negative | Passed | 2223ms |
| TC-009-P | should render between 1 and 20 book items on page 2 | Boundary | Passed | 3017ms |
| TC-010-P | should advance sequentially to page 3 with a further distinct book set | Positive | Passed | 3049ms |
| TC-011-F | should not revisit a previously seen page across three consecutive "next" clicks | Negative | Passed | 4269ms |
| TC-012-P | should reach page 50 without error when clicking "next" from page 49 | Boundary | **Failed** | 2784ms |
| TC-013-P | should not render a "next" control on page 50 | Positive | Passed | 4355ms |
| TC-014-F | should still show a visible "previous" control on page 50 | Negative | Passed | 2752ms |
| TC-015-P | should show "next" on page 49 but not on page 50 | Boundary | Passed | 3656ms |
| TC-016-P | should show "Page 2 of 50" in the page indicator after one "next" click | Positive | Passed | 2871ms |
| TC-017-F | should not retain the page 1 indicator text after navigating to page 2 | Negative | Passed | 2597ms |
| TC-018-P | should show a well-formed "Page 50 of 50" indicator on the last page | Boundary | Passed | 2106ms |
| TC-019-P | should return a 404 with no catalogue grid when navigating beyond the last page | Positive | Passed | 2212ms |
| TC-020-F | should not re-serve page 50's book set on the beyond-last-page URL | Negative | Passed | 2244ms |
| TC-021-P | should treat page 50 as valid and page 51 as the exact failure boundary | Boundary | Passed | 2203ms |
| TC-022-P | should restore page 1's URL and book set after browser back navigation | Positive | Passed | 2883ms |
| TC-023-F | should show the "next" control again after navigating back to page 1 | Negative | Passed | 2877ms |
| TC-024-P | should restore page 2's URL and book set after back then forward navigation | Boundary | Passed | 2521ms |

## 5. Failures Analysis

**TC-012-P — "should reach page 50 without error when clicking 'next' from page 49" [FR-04]**

- **Assertion that failed**: `expect(count).toBeGreaterThan(0)` at `tests/playwright/httpbookstoscrapecom-navigate-to-the-nex.spec.ts:206`, where `count = await cataloguePage.bookItems().count()`. Received `0`, expected `> 0`.
- **What happened**: The preceding assertion (`expect(page.url()).toContain('page-50')`) passed, confirming navigation completed and the URL updated correctly. The book-item count check immediately afterward found zero `article.product_pod` elements.
- **Likely cause**: A test-script race condition rather than a real site defect. `clickNext()` (spec.ts lines 54-59) resolves as soon as `page.waitForURL(...)` matches the URL, which does not guarantee the catalogue grid has finished rendering. `Locator.count()` samples the DOM once and does not auto-retry the way `expect(locator).toHaveCount(...)` does, so on this run the count was read before the page-50 grid painted. Corroborating evidence: TC-013-P, TC-015-P, TC-018-P, and TC-021-P all reach page 50 by other means (`gotoPath`, direct navigation) and correctly observe rendered content in this same run; no other page-50 test failed; and a prior run of this identical spec (see file history) recorded 24/24 passing, including this exact test.
- **Recommended fix**: Replace the bare `count()` read with an auto-retrying assertion, e.g. `await expect(cataloguePage.bookItems().first()).toBeVisible()` before counting, or assert directly via `await expect(cataloguePage.bookItems()).not.toHaveCount(0)`.
- **Fault-detection relevance**: None. TC-012-P is a positive/boundary case (`Fault Type: n/a` in the TC doc), not one of the 9 negative fault-detection cases, so this failure does not affect the fault detection rate in Section 3.

All other 23 tests, including all 9 negative fault-detection assertions, passed. Every test title maps 1:1 to a TC entry in `docs/test-cases/TC_httpbookstoscrapecom-navigate-to-the-nex.md`; no untraceable tests were found.

**Independent reproduction (2026-07-05, later same day)**: the suite was re-executed twice more for this evaluation pass. Run A reproduced the identical failure — same test (TC-012-P), same assertion at spec.ts:206, `count` again `0` — with no code changes in between. Run B, an immediate retry with still no code changes, passed 24/24. This two-run pattern (fail, then clean pass, on an unmodified script) directly corroborates the race-condition diagnosis above: the fault is in test timing (`count()` sampling the DOM before the page-50 grid paints), not in the site's pagination behaviour or in nondeterminism of the fault-detection assertions themselves. `test-results/results.json` in this repository reflects Run B (24/24); the metrics tables in Sections 1 and 6 above report the earlier failing run (23/24) because it is the more informative data point for a suite whose test script has a demonstrated flake.

## 6. Summary for Dissertation

| Metric | Score |
|--------|-------|
| Success rate | 95.83% (23/24) |
| FR coverage | 100% (8/8) |
| Fault detection rate | 100% (9/9) |
| Total TCs | 24 |
| Positive TCs | 15 |
| Negative TCs | 9 |
