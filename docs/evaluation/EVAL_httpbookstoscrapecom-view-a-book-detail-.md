# Evaluation Report: httpbookstoscrapecom-view-a-book-detail-

**System**: Multi-Agent Pipeline (PO → BA → Dev → Tester → Evaluator)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-02
**Target Application**: Books to Scrape (http://books.toscrape.com) — Book detail page

## 1. Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests generated | 24 |
| Tests passed | 24 |
| Tests failed | 0 |
| **Success rate** | **100%** |
| Total execution time | 27.3s |

## 2. FR Coverage

| FR | Description | Tests Covering It | Covered? |
|----|-------------|-------------------|----------|
| FR-01 | Book title display | TC-001-P, TC-002-F, TC-003-F | Yes |
| FR-02 | Price display and consistency | TC-004-P, TC-005-P, TC-006-F | Yes |
| FR-03 | Availability status display | TC-007-P, TC-008-F, TC-009-F | Yes |
| FR-04 | Product description display | TC-010-P, TC-011-F, TC-012-F | Yes |
| FR-05 | Star rating display | TC-013-P, TC-014-F, TC-015-F | Yes |
| FR-06 | Product information table display | TC-016-P, TC-017-F, TC-018-F | Yes |
| FR-07 | Navigation from catalogue to correct detail page | TC-019-P, TC-020-P, TC-021-F | Yes |
| FR-08 | Cover image display | TC-022-P, TC-023-F, TC-024-F | Yes |

**FR coverage**: 8 / 8 requirements covered (100%)

## 3. Fault Detection Capacity

| TC ID | Fault Type | Detected? |
|-------|------------|-----------|
| TC-002-F | input validation — apostrophe title rendered literally, no truncation/entity mangling | Yes |
| TC-003-F | input validation — missing title element | Yes |
| TC-006-F | input validation — non-numeric/malformed price string | Yes |
| TC-008-F | state — zero-copy availability distinguished from absent | Yes |
| TC-009-F | input validation — missing/empty availability text | Yes |
| TC-012-F | state — entirely absent description section | Yes |
| TC-015-F | input validation — invalid/out-of-range rating class | Yes |
| TC-018-F | state — entirely missing product information table | Yes |
| TC-021-F | navigation — click does not silently fail to navigate | Yes |
| TC-024-F | state — broken cover image resource (zero natural width) | Yes |

**Distinct fault types**: 3 (input validation, state, navigation)
**Fault detection rate**: 10 / 10 (100%)

Note: TC-011-F, TC-014-F, TC-017-F, TC-023-F are boundary tests (Fault Type: n/a in the TC doc) — they verify correct acceptance of edge-case-but-valid data (e.g. a very short description, exactly one rating element) rather than fault detection, so they are excluded from the fault-detection denominator above.

## 4. Individual Test Results

| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | should display a non-empty book title after navigating from the catalogue | Positive | Passed | 1576ms |
| TC-002-F | should render an apostrophe title literally with no truncation or HTML entity | Boundary | Passed | 1189ms |
| TC-003-F | should detect a missing title element as absent | Negative | Passed | 90ms |
| TC-004-P | should display the price in £XX.XX format | Positive | Passed | 1916ms |
| TC-005-P | should show a detail-page price equal to the homepage catalogue price for the same book | Positive | Passed | 2196ms |
| TC-006-F | should detect a non-numeric price string as unparseable | Negative | Passed | 96ms |
| TC-007-P | should show "In stock" with a parenthesised numeric copy count | Positive | Passed | 1753ms |
| TC-008-F | should parse a zero copy count as the integer 0, not as absent | Boundary | Passed | 92ms |
| TC-009-F | should detect an empty availability element as invalid | Negative | Passed | 76ms |
| TC-010-P | should display a visible, non-empty product description | Positive | Passed | 1016ms |
| TC-011-F | should treat a very short description as present, requiring no minimum length | Boundary | Passed | 106ms |
| TC-012-F | should detect an entirely absent description section | Negative | Passed | 85ms |
| TC-013-P | should have a star-rating class matching one of the five valid rating words | Positive | Passed | 1391ms |
| TC-014-F | should have exactly one star-rating element on the detail page | Boundary | Passed | 1423ms |
| TC-015-F | should detect a rating class outside the five valid rating words | Negative | Passed | 92ms |
| TC-016-P | should list all seven expected table headers in order | Positive | Passed | 2049ms |
| TC-017-F | should show valid £XX.XX values for price excl. tax, price incl. tax, and tax rows | Boundary | Passed | 1053ms |
| TC-018-F | should detect an entirely missing product information table | Negative | Passed | 101ms |
| TC-019-P | should navigate to the detail page matching the clicked catalogue title | Positive | Passed | 1713ms |
| TC-020-P | should navigate to the detail page matching the clicked cover image | Positive | Passed | 1948ms |
| TC-021-F | should change the URL after clicking a book title link | Negative | Passed | 2040ms |
| TC-022-P | should display a cover image that resolves with non-zero natural dimensions | Positive | Passed | 1334ms |
| TC-023-F | should have a non-empty, non-placeholder src attribute on the cover image | Boundary | Passed | 2181ms |
| TC-024-F | should detect a broken cover image resource as having zero natural width | Negative | Passed | 1093ms |

## 5. Failures Analysis

No failures. All 24 tests passed on this run, including all simulated-fault tests (which assert that the injected fault condition is correctly caught by the check under test) and all boundary/positive tests against the live site.

## 6. Summary for Dissertation

| Metric | Score |
|--------|-------|
| Success rate | 100% |
| FR coverage | 100% |
| Fault detection rate | 100% |
| Total TCs | 24 |
| Positive TCs | 10 |
| Negative TCs | 14 |
