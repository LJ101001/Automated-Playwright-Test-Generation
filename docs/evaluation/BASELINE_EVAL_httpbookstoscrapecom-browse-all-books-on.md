# Baseline Evaluation Report: httpbookstoscrapecom-browse-all-books-on

**System**: Single-Agent Baseline (no role decomposition)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-06-24
**Requirement**: http://books.toscrape.com — browse all books on the homepage

## Test Execution Summary

| Metric | Value |
|--------|-------|
| Total tests | 9 |
| Tests passed | 9 |
| Tests failed | 0 |
| Success rate | 100% |
| Duration | 15.23s |

## Per-Test Results

| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | homepage displays the All products header | Positive | PASSED | 1913ms |
| TC-002-P | homepage lists 20 book products | Positive | PASSED | 2088ms |
| TC-003-P | first book pod displays title, price and availability | Positive | PASSED | 2092ms |
| TC-004-P | next link navigates to page 2 | Positive | PASSED | 1698ms |
| TC-005-P | clicking a book title opens its detail page | Positive | PASSED | 2228ms |
| TC-006-P | sidebar displays 50 category links including Travel | Positive | PASSED | 1406ms |
| TC-007-F | last page of results has no next link | Negative | PASSED | 2124ms |
| TC-008-F | out-of-range page number returns 404 | Negative | PASSED | 371ms |
| TC-009-F | nonexistent product detail page returns 404 | Negative | PASSED | 339ms |

## Failures Analysis

No failures. All 9 tests passed on the first execution; no iteration was required.

## Functional Requirements Coverage

| FR ID | Description | Tests Covering |
|-------|-------------|----------------|
| FR-01 | Homepage displays the "All products" page header | TC-001-P |
| FR-02 | Homepage lists exactly 20 book pods, each with title, price and availability | TC-002-P, TC-003-P |
| FR-03 | Pagination advances to subsequent pages and is bounded at the final page / out-of-range requests | TC-004-P, TC-007-F, TC-008-F |
| FR-04 | Clicking a book title opens its correct product detail page; nonexistent products 404 | TC-005-P, TC-009-F |
| FR-05 | Sidebar exposes all 50 browsable category links | TC-006-P |

**FR Coverage**: 5 / 5 = 100%

## Fault Detection Capacity

Distinct fault categories targeted by negative tests:

| Category | Test(s) | Fault Scenario |
|----------|---------|----------------|
| Pagination boundary – last page | TC-007-F | Spurious "next" link rendered on the final catalogue page |
| Pagination boundary – out-of-range | TC-008-F | Server fails to return 404 for a non-existent catalogue page |
| Routing – nonexistent resource | TC-009-F | Server fails to return 404 for a non-existent product detail page |

**Distinct fault categories**: 3

## Summary

Working single-pass from the live site, this run produced 9 executable Playwright tests (6 positive, 3 negative) covering five functional requirements derived directly from the "browse all books on the homepage" feature: the page header, the 20-item product grid with per-item metadata, forward pagination with last-page and out-of-range boundary checks, detail-page navigation with a 404 check for a missing product, and the category sidebar. All selectors were confirmed against the live DOM via a headless Playwright diagnostic script rather than relying solely on the WebFetch markdown summary, which omitted exact class names (e.g. `.product_pod`, `.price_color`, `.side_categories`). Not covered: total-result-count text ("1000 results"), star-rating values, "Add to basket" interaction, basket state, and breadcrumb correctness on category/detail pages — gaps that a role-decomposed pipeline with a dedicated Business Analyst elicitation pass is more likely to surface independently, since a single pass tends to stop once a plausible-looking requirement set is satisfied.
