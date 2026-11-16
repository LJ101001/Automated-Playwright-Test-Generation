# Baseline Evaluation Report: httpbookstoscrapecom-add-a-book-to-the-b

**System**: Single-Agent Baseline (no role decomposition)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-04
**Requirement**: http://books.toscrape.com — add a book to the basket from the product page

## Test Execution Summary
| Metric | Value |
|--------|-------|
| Total tests | 6 |
| Tests passed | 6 |
| Tests failed | 0 |
| Success rate | 100% |
| Duration | 10.3s |

## Per-Test Results
| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | add-to-basket button is visible and enabled for an in-stock book on the listing page | Positive | Passed | 1452ms |
| TC-002-P | clicking add-to-basket submits without navigating to an error page | Positive | Passed | 2114ms |
| TC-003-P | listing card displays matching title, price and stock status | Positive | Passed | 1392ms |
| TC-004-F | navigating to a non-existent product URL returns 404 without a basket control | Negative | Passed | 359ms |
| TC-005-F | product detail page has no add-to-basket button for the viewed book | Negative | Passed | 2132ms |
| TC-006-F | no basket indicator appears anywhere after clicking add-to-basket | Negative | Passed | 2100ms |

## Failures Analysis
No failures occurred. All 6 tests passed on the first execution (no iteration or fix-up cycles were needed).

## Summary
Live-site discovery (via WebFetch and a Playwright diagnostic script) revealed that the literal requirement — "add a book to the basket from the product page" — does not correspond to any real control on books.toscrape.com: the `.product_main` region of the product detail page contains no `<button>` matching "Add to basket" and no functional basket form. The only "Add to basket" control on the entire site lives on the catalogue listing tile (`article.product_pod`), implemented as a bare `<form>` with no `action`/`method`, which submits as a GET to the current URL and appends an empty `?` query string — a cosmetic no-op with no confirmation message, counter, or basket page ever rendered anywhere on the site.

As a single-agent baseline working from the literal requirement text alone, the resulting suite covers the listing-page basket affordance as the closest observable proxy for the requirement (visibility/enablement, submission without error, and correct product identity alongside the control), and treats the absence of a product-page basket control as an explicit negative/edge-case finding (TC-005-F) rather than silently working around it. It also covers a 404 edge case for an invalid product URL and confirms no basket state persists anywhere in the UI after the action. What it does not do — because there was no second agent role to challenge the requirement framing before implementation began — is produce a separate human-readable rationale distinguishing "requirement as written" from "requirement as actually implementable," or flag upfront (before test authoring) that the requirement may not be testable as literally stated. All FR-to-test traceability and site-behaviour caveats are folded into the single spec file's test comments rather than surfaced across dedicated planning artefacts.
