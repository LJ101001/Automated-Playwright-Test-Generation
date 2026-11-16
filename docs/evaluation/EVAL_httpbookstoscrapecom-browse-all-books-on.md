# Evaluation Report: httpbookstoscrapecom-browse-all-books-on

**System**: Multi-Agent Pipeline (PO → BA → Dev → Tester → Evaluator)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-06-24
**Target Application**: Books to Scrape (http://books.toscrape.com)

## 1. Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests generated | 20 |
| Tests passed | 20 |
| Tests failed | 0 |
| **Success rate** | **100%** |
| Total execution time | 34.2s |

## 2. FR Coverage

| FR | Description | Tests Covering It | Covered? |
|----|-------------|--------------------|----------|
| FR-01 | Homepage loads successfully | TC-001-P, TC-001-F | Yes |
| FR-02 | Book listing displays exactly 20 items per page | TC-002-P, TC-002-F | Yes |
| FR-03 | Each book displays a cover image and title | TC-003-P, TC-003-F | Yes |
| FR-04 | Each book displays a price in GBP format | TC-004-P, TC-004-F | Yes |
| FR-05 | Each book displays an availability status | TC-005-P, TC-005-F | Yes |
| FR-06 | Each book displays a machine-readable star rating | TC-006-P, TC-006-F | Yes |
| FR-07 | Pagination controls are present and functional | TC-007-P, TC-007-F, TC-008-P, TC-008-F | Yes |
| FR-08 | Book title/image links to a detail page | TC-009-P, TC-009-F | Yes |
| FR-09 | Page title and site heading identify the application | TC-010-P, TC-010-F | Yes |

**FR coverage**: 9 / 9 requirements covered (100%)

## 3. Fault Detection Capacity

| TC ID | Fault Type | Detected? |
|-------|------------|-----------|
| TC-001-F | navigation — invalid path returns 404 with no catalogue | Yes |
| TC-002-F | state — book count is not an off-by-one (19/21) value | Yes |
| TC-003-F | input validation — book with empty title attribute | Yes |
| TC-004-F | state — missing price element | Yes |
| TC-005-F | state — missing availability element | Yes |
| TC-006-F | input validation — unrecognised rating token | Yes |
| TC-007-F | navigation — previous link incorrectly present on page 1 | Yes |
| TC-008-F | navigation — next link incorrectly present on last page | Yes |
| TC-009-F | navigation — page beyond last renders empty catalogue instead of 404 | Yes |
| TC-010-F | state — site header missing or empty | Yes |

**Distinct fault types**: 3 (navigation, state, input validation)
**Fault detection rate**: 10 / 10 (100%)

## 4. Individual Test Results

| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | should load homepage with HTTP 200 and at least one visible book item | Positive | Passed | 1473ms |
| TC-001-F | should return 404 and render no book items for an invalid path | Negative | Passed | 351ms |
| TC-002-P | should display exactly 20 book items on page 1 | Positive | Passed | 2054ms |
| TC-002-F | should not display 19 or 21 book items on page 1 | Boundary | Passed | 2067ms |
| TC-003-P | should show a non-empty cover image src for every book | Positive | Passed | 2098ms |
| TC-003-F | should not have any book with an empty title attribute | Negative | Passed | 2057ms |
| TC-004-P | should show a valid GBP-formatted price for every book | Positive | Passed | 1426ms |
| TC-004-F | should not have any book missing a visible price element | Negative | Passed | 2053ms |
| TC-005-P | should show a non-empty availability label for every book | Positive | Passed | 2024ms |
| TC-005-F | should not have any book missing the availability element | Negative | Passed | 1436ms |
| TC-006-P | should show a valid star-rating class for every book | Positive | Passed | 1397ms |
| TC-006-F | should not contain an invalid rating token on the first book | Boundary | Passed | 1374ms |
| TC-007-P | should show a visible next link with a valid href on page 1 | Positive | Passed | 2019ms |
| TC-007-F | should not show a previous link on page 1 | Negative | Passed | 1395ms |
| TC-008-P | should navigate to page 2 with a distinct set of books when next is clicked | Positive | Passed | 2218ms |
| TC-008-F | should not show a next link on page 50 but should show a previous link | Boundary | Passed | 2042ms |
| TC-009-P | should navigate to a catalogue detail page when a book title is clicked | Positive | Passed | 2185ms |
| TC-009-F | should return 404 for a page number beyond the last valid page | Negative | Passed | 350ms |
| TC-010-P | should have a page title containing "Books" | Positive | Passed | 1498ms |
| TC-010-F | should show a visible header containing the site name | Negative | Passed | 2019ms |

## 5. Failures Analysis

No failures occurred. All 20 tests (10 positive, 10 negative/boundary) executed successfully against the live target application, confirming both the correctness of the happy-path behaviour and the absence of the specific fault conditions probed by the negative test suite.

## 6. Summary for Dissertation

| Metric | Score |
|--------|-------|
| Success rate | 100% |
| FR coverage | 100% |
| Fault detection rate | 100% |
| Total TCs | 20 |
| Positive TCs | 10 |
| Negative TCs | 10 |
