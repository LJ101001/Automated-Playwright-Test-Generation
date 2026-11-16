# Evaluation Report: httpbookstoscrapecom-add-a-book-to-the-b

**System**: Multi-Agent Pipeline (PO → BA → Dev → Tester → Evaluator)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-04
**Target Application**: Books to Scrape (http://books.toscrape.com) — Add a book to the basket

## 1. Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests generated | 12 |
| Tests passed | 12 |
| Tests failed | 0 |
| **Success rate** | **100%** |
| Total execution time | 26.46s |

## 2. FR Coverage

| FR | Description | Tests Covering It | Covered? |
|----|-------------|--------------------|----------|
| FR-01 | Add to Basket control availability | TC-001-P, TC-001-F | Yes |
| FR-02 | Add to Basket action confirmation | TC-002-P, TC-002-F | Yes |
| FR-03 | Confirmation reflects correct book | — | No (NOT TESTABLE — depends on FR-02 confirmation mechanism, which does not exist on this site) |
| FR-04 | Default quantity is one | — | No (NOT TESTABLE — no quantity/basket state ever surfaced) |
| FR-05 | Quantity selection (conditional) | — | No (NOT APPLICABLE — no quantity input exists anywhere on the site) |
| FR-06 | Repeat add-to-basket behaviour | TC-003-P, TC-003-F, TC-004-F | Yes |
| FR-07 | Cross-product consistency | TC-005-P | Yes |
| FR-08 | Page stability after add | TC-006-P, TC-006-F | Yes |
| FR-09 | Navigation persistence / non-duplication | TC-007-P, TC-007-F | Yes |

**FR coverage**: 6 / 9 requirements covered (67%)

Note: FR-03, FR-04, and FR-05 are excluded from the denominator of "testable" coverage because the Developer's live-site verification confirmed the underlying mechanisms they depend on (a confirmation message/basket view, a quantity value, a quantity selector) do not exist on Books to Scrape — this is a site-behaviour ceiling, not a gap in test authoring. Coverage of the **testable** FR subset is 6 / 6 (100%).

## 3. Fault Detection Capacity

| TC ID | Fault Type | Detected? |
|-------|------------|-----------|
| TC-001-F | navigation — control absent on a page where it might mistakenly be assumed present | Yes |
| TC-002-F | state — false confirmation message must not appear | Yes |
| TC-003-F | state — duplicate line item/counter must not appear on repeat click | Yes |
| TC-004-F | state — page must not corrupt or error under rapid repeated clicks | Yes |
| TC-006-F | state — no uncaught JS/console errors on click | Yes |
| TC-007-F | state — no confirmation state must appear from navigation alone | Yes |

**Distinct fault types**: 2 (navigation, state)
**Fault detection rate**: 6 / 6 (100%)

## 4. Individual Test Results

| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | should show a visible, enabled Add to Basket button on the homepage tile | Positive | Passed | 1506ms |
| TC-001-F | should not find an Add to Basket button on the product detail page | Negative | Passed | 2436ms |
| TC-002-P | should reload to the current URL with an empty query string when Add to Basket is clicked | Positive | Passed | 2566ms |
| TC-002-F | should not show any confirmation message when Add to Basket is clicked | Negative | Passed | 1666ms |
| TC-003-P | should produce the same reload outcome on a second Add to Basket click after re-navigation | Positive | Passed | 2451ms |
| TC-003-F | should not surface any basket counter or duplicate confirmation on a second click | Negative | Passed | 2521ms |
| TC-004-F | should settle into the defined no-op state with no errors after rapid repeated clicks | Boundary | Passed | 2965ms |
| TC-005-P | should produce the same reload outcome for two different books | Positive | Passed | 1893ms |
| TC-006-P | should keep the page rendered and interactive after Add to Basket is clicked | Positive | Passed | 2391ms |
| TC-006-F | should not raise any uncaught JavaScript errors when Add to Basket is clicked | Negative | Passed | 1744ms |
| TC-007-P | should render the homepage tile correctly after navigating away and back | Positive | Passed | 1951ms |
| TC-007-F | should not create any confirmation state from navigation alone with no click | Negative | Passed | 1676ms |

All 12 test titles trace 1:1 to a TC entry in `docs/test-cases/TC_httpbookstoscrapecom-add-a-book-to-the-b.md` — no untraceable tests.

## 5. Failures Analysis

No failures occurred. All 12 tests passed on this run with zero retries and zero flakiness.

**Traceability flag**: FR-03, FR-04, and FR-05 have zero tests tracing to them. This is not a gap introduced by the Tester agent — the Developer agent's live verification (see `docs/specs/IMPL_SUMMARY_httpbookstoscrapecom-add-a-book-to-the-b.md`) found that Books to Scrape's "Add to basket" control is a cosmetic template artefact: it does not exist on the product detail page (only on listing-page tiles), there is no quantity field anywhere on the site, and clicking it only triggers a method-less `<form>` GET-reload to the current URL with an appended empty query string. Per the Functional Spec's own contingency clause, the Tester correctly marked these three FRs NOT TESTABLE / NOT APPLICABLE rather than asserting against application state that does not exist. This is a target-application limitation, not a pipeline defect, but it caps all-FR coverage at 67% for this feature regardless of test quality.

## 6. Summary for Dissertation

| Metric | Score |
|--------|-------|
| Success rate | 100% |
| FR coverage (all FRs) | 67% (6/9) |
| FR coverage (testable FRs only) | 100% (6/6) |
| Fault detection rate | 100% (6/6) |
| Total TCs | 12 |
| Positive TCs | 6 |
| Negative/Boundary TCs | 6 |

**Interpretation note**: This feature is a notable case study for the dissertation — the multi-agent pipeline's Developer role caught, via live-site verification, that the target site's "add to basket" control is a non-functional UI artefact (a bare `<form>` with no action/method that just reloads the current page). Rather than generating tests against invented/hallucinated behaviour (e.g. asserting a basket counter that doesn't exist), the pipeline correctly rescoped FR-01/02/06/07/08/09 to the confirmed GET-reload-to-`?` behaviour and marked FR-03/04/05 NOT TESTABLE/NOT APPLICABLE. This demonstrates the pipeline's capacity to avoid false-positive test generation when a feature's assumed behaviour diverges from live-site reality — a failure mode a single-agent approach without a dedicated live-verification step may be more prone to.
