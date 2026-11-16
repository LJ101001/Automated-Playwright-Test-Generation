# Baseline Evaluation Report: httpbookstoscrapecom-filter-books-by-the

**System**: Single-Agent Baseline (no role decomposition)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-02
**Requirement**: http://books.toscrape.com — filter books by the Mystery category

## Test Execution Summary
| Metric | Value |
|--------|-------|
| Total tests | 7 |
| Tests passed | 7 |
| Tests failed | 0 |
| Success rate | 100% |
| Duration | 11.1s |

## Per-Test Results
| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | clicking the Mystery sidebar link filters the catalogue to the Mystery category | Positive | Passed | 2068ms |
| TC-002-P | Mystery category page displays a Mystery heading and a Home > Books > Mystery breadcrumb | Positive | Passed | 1423ms |
| TC-003-P | Mystery category page 1 shows the correct result count text and 20 product cards | Positive | Passed | 1933ms |
| TC-004-P | paginating within the Mystery category advances to page 2 with the remaining 12 books | Positive | Passed | 1545ms |
| TC-005-F | Mystery filtered results do not include a book known to belong to another category | Negative | Passed | 2006ms |
| TC-006-F | navigating to a nonexistent category URL returns a 404 page | Negative | Passed | 332ms |
| TC-007-F | the final page of Mystery results has no next pagination link | Negative/Edge | Passed | 1140ms |

## Failures Analysis
No failures occurred. All 7 tests passed on the first execution with no retries required.

## Functional Requirement Coverage
Seven functional requirements were mentally decomposed from the feature and mapped to tests:

| FR | Description | Covered By |
|----|--------------|-----------|
| FR-01 | User can filter the catalogue to the Mystery category via the sidebar link | TC-001-P |
| FR-02 | Filtered page identifies itself via heading and breadcrumb trail | TC-002-P |
| FR-03 | Filtered results report an accurate result count and matching card count | TC-003-P |
| FR-04 | Pagination within the filtered category preserves the Mystery filter across pages | TC-004-P |
| FR-05 | Filtered results must not include books belonging to other categories (filter correctness) | TC-005-F |
| FR-06 | Invalid/non-existent category URLs return a 404, not a silently unfiltered catalogue | TC-006-F |
| FR-07 | The final page of filtered results has no further pagination control (boundary case) | TC-007-F |

FR coverage: 7/7 assigned FRs have at least one passing test.

## Fault Detection Capacity
The negative/edge tests exercise 3 distinct fault categories:
1. **Over-inclusive filter fault** (TC-005-F) — detects the category filter leaking a book from another category (e.g. a filter implementation that ignores the category parameter and returns the full catalogue) by asserting a known non-Mystery title ("A Light in the Attic") is absent from the Mystery result set.
2. **Invalid-route fault** (TC-006-F) — detects the site silently rendering an empty/default listing instead of a proper 404 for a category slug that does not exist, by asserting both HTTP status and page title.
3. **Pagination boundary fault** (TC-007-F) — detects a stray/duplicate "next" control appearing after the last page of filtered results, which would let a user page past the end of the filtered set.

## Summary
The single-agent baseline produced 7 tests (4 positive, 3 negative) covering navigation into the Mystery category, heading/breadcrumb confirmation, result-count and card-count accuracy, forward pagination continuity, filter-leakage detection, 404 handling for an invalid category route, and pagination-boundary behaviour. All selectors (`.side_categories` link by accessible name, `.page-header h1`, `.form-horizontal`, `.breadcrumb li`, `.product_pod`, `.product_pod h3 a`, `.pager .next a`) were confirmed against the live site via raw HTML fetched with curl before use, and all 7 tests passed on the first run with no flakiness. Coverage is solid for the filtering, identity, and pagination mechanics of a single category, but — consistent with a single-agent, single-pass approach — it does not explore cross-category switching (filtering into Mystery, then into a second category, then back), sort/price-range interactions layered on top of the filter, per-book field validation (price format, star-rating value, stock status) within the filtered set, or accessibility attributes (aria-labels, keyboard-only navigation of the sidebar) that a dedicated business-analyst or tester role might have surfaced as separate acceptance criteria. Because a single agent both decomposes the requirement and writes the tests in one pass, the FR list and the fault taxonomy are self-assigned rather than independently reviewed, which is the main structural gap the multi-agent condition is designed to test against.
