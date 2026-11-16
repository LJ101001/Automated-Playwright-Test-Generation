# Baseline Evaluation Report: httpbookstoscrapecom-view-a-book-detail-

**System**: Single-Agent Baseline (no role decomposition)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-03
**Requirement**: http://books.toscrape.com — view a book detail page and verify title price and availability

## Test Execution Summary
| Metric | Value |
|--------|-------|
| Total tests | 9 |
| Tests passed | 9 |
| Tests failed | 0 |
| Success rate | 100% |
| Duration | 14.19s |

## Per-Test Results
| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | shows the correct book title | Positive | Passed | 2263ms |
| TC-002-P | shows the correct price | Positive | Passed | 2015ms |
| TC-003-P | shows the correct availability status | Positive | Passed | 2019ms |
| TC-004-P | shows correct, distinct data for a second book | Positive | Passed | 1764ms |
| TC-005-P | navigates from the homepage to the correct detail page | Positive | Passed | 1540ms |
| TC-006-P | keeps the info table consistent with the summary panel | Positive | Passed | 2242ms |
| TC-007-F | returns 404 for a non-existent book URL | Negative | Passed | 376ms |
| TC-008-F | returns 404 for a malformed catalogue path | Negative | Passed | 349ms |
| TC-009-F | breadcrumb active item is the book title, not an ancestor crumb | Negative | Passed | 1028ms |

## Failures Analysis
None — all 9 tests passed on the first execution. No iteration or fixes were required.

## Summary
The single-agent baseline produced 9 tests (6 positive, 3 negative) against 8 self-assigned functional requirements (FR-01 through FR-08), covering title, price, availability, cross-book data isolation, homepage-to-detail navigation, product-info-table consistency, 404 handling for non-existent and malformed catalogue URLs, and breadcrumb correctness. Coverage was reasonably thorough for a single pass with no stakeholder decomposition — it caught the two most obvious negative cases (missing product, malformed path) but did not probe deeper fault categories such as case-sensitivity of the slug, trailing-slash variants, direct navigation with query parameters, or stock-count boundary values (e.g. "In stock" with no count vs. "Out of stock"), since no distinct role existed to challenge the implementation from an adversarial or edge-case-focused perspective. All selectors were confirmed against the live site before use, and no waitForTimeout() or unconfirmed locators were introduced.
