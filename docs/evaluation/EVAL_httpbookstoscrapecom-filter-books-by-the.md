# Evaluation Report: httpbookstoscrapecom-filter-books-by-the

**System**: Multi-Agent Pipeline (PO → BA → Dev → Tester → Evaluator)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-02
**Target Application**: Books to Scrape (http://books.toscrape.com) — filter books by the "Mystery" category

## 1. Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests generated | 16 |
| Tests passed | 16 |
| Tests failed | 0 |
| **Success rate** | **100%** |
| Total execution time | 30.5s |

## 2. FR Coverage

| FR | Description | Tests Covering It | Covered? |
|----|-------------|--------------------|----------|
| FR-01 | Category navigation link is present and selectable | TC-001-P, TC-002-F, TC-003-P | Yes |
| FR-02 | Mystery category page identifies itself correctly | TC-004-P, TC-005-F | Yes |
| FR-03 | Only Mystery-category books are displayed in the results | TC-006-P, TC-007-F, TC-008-F | Yes |
| FR-04 | Displayed result count matches the number of books shown | TC-009-P, TC-010-F | Yes |
| FR-05 | Each book listing preserves standard catalogue information | TC-011-P, TC-012-F | Yes |
| FR-06 | Navigating from a filtered listing to product detail preserves accuracy | TC-013-P, TC-014-F | Yes |
| FR-07 | Category filter is reachable via direct URL and repeated activation | TC-015-P, TC-016-F | Yes |

**FR coverage**: 7 / 7 requirements covered (100%)

## 3. Fault Detection Capacity

| TC ID | Fault Type | Detected? |
|-------|------------|-----------|
| TC-002-F | input validation — sidebar link text conflated with adjacent categories (Crime, Thriller) | Yes |
| TC-005-F | input validation — heading padded/conflated with another category name | Yes |
| TC-007-F | state — zero-result category renders without error (route-intercepted empty fixture) | Yes |
| TC-008-F | navigation — filter/heading fails to persist across pagination | Yes |
| TC-010-F | state — final-page item count fails to reconcile with total | Yes |
| TC-012-F | input validation — empty title, malformed price, or missing availability text on a listing | Yes |
| TC-014-F | navigation — clicking a listing leaks to the wrong product detail page | Yes |
| TC-016-F | navigation — repeated filter activation is not idempotent (unexpected navigation/duplication) | Yes |

**Distinct fault types**: 3 (input validation, state, navigation)
**Fault detection rate**: 8 / 8 negative/boundary TCs passed their assertions (100%)

## 4. Individual Test Results

| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | should navigate to the Mystery category page when the sidebar link is clicked | Positive | Passed | 2374ms |
| TC-002-F | should have exactly one exact-text "Mystery" sidebar link that resolves to the correct category | Negative | Passed | 2289ms |
| TC-003-P | should reach the Mystery category page from a non-homepage page that renders the sidebar | Positive | Passed | 1976ms |
| TC-004-P | should display a heading equal to "Mystery" on the category page | Positive | Passed | 2058ms |
| TC-005-F | should not display a heading conflated with another category or padded with extra text | Negative | Passed | 1443ms |
| TC-006-P | should confirm the first listing belongs to Mystery via its own product-page breadcrumb | Positive | Passed | 2239ms |
| TC-007-F | should render without error when the category returns zero results | Boundary | Passed | 89ms |
| TC-008-F | should keep the Mystery filter and heading intact when paginating to the next page | Boundary | Passed | 1610ms |
| TC-009-P | should show a total result count equal to the sum of listings across both pages | Positive | Passed | 2604ms |
| TC-010-F | should show a final-page item count matching the remainder of the total, with no further pagination | Boundary | Passed | 2636ms |
| TC-011-P | should show a non-empty title, formatted price, and in-stock availability on the first listing | Positive | Passed | 1557ms |
| TC-012-F | should not have any listing with an empty title, malformed price, or missing availability text | Negative | Passed | 2178ms |
| TC-013-P | should open a product detail page whose heading matches the clicked listing title | Positive | Passed | 2240ms |
| TC-014-F | should not navigate to the second listing product page when the first listing is clicked | Negative | Passed | 1603ms |
| TC-015-P | should render the correct heading and item count when navigating directly to the Mystery URL | Boundary | Passed | 1425ms |
| TC-016-F | should stay on the same Mystery page with an unchanged item count after repeated filter clicks | Negative | Passed | 1544ms |

## 5. Failures Analysis

No failures occurred. All 16 tests passed on this run (0 flaky, 0 skipped, 0 unexpected).

## 6. Summary for Dissertation

| Metric | Score |
|--------|-------|
| Success rate | 100% |
| FR coverage | 100% |
| Fault detection rate | 100% |
| Total TCs | 16 |
| Positive TCs | 8 |
| Negative/Boundary TCs | 8 |
