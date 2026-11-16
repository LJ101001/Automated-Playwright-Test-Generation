# Baseline Evaluation Report: httpbookstoscrapecom-navigate-to-the-nex

**System**: Single-Agent Baseline (no role decomposition)
**Dissertation**: Lewis Watson, 40619754
**Date**: 2026-07-05
**Requirement**: http://books.toscrape.com — navigate to the next page of results

## Test Execution Summary
| Metric | Value |
|--------|-------|
| Total tests | 8 |
| Tests passed | 8 |
| Tests failed | 0 |
| Success rate | 100% |
| Duration | 17.4s |

## Per-Test Results
| TC ID | Test Name | Type | Status | Duration |
|-------|-----------|------|--------|----------|
| TC-001-P | home page displays "All products" heading and page 1 of 50 | Positive | Passed | 2253ms |
| TC-002-P | next link is visible and enabled on the first page | Positive | Passed | 2209ms |
| TC-003-P | clicking next navigates to page 2 with a new set of books | Positive | Passed | 2430ms |
| TC-004-P | previous link appears on page 2 and navigates back to page 1 | Positive | Passed | 2500ms |
| TC-005-P | repeated next clicks advance sequentially through pages 1, 2 and 3 | Positive | Passed | 2752ms |
| TC-006-F | next link is not present on the final page (page 50) | Negative | Passed | 2103ms |
| TC-007-F | previous link is not present on the first page | Negative | Passed | 2092ms |
| TC-008-F | navigating directly to a page beyond the last page returns 404 | Negative | Passed | 353ms |

## Failures Analysis

None — all 8 tests passed on the first execution with no retries or flakiness. The live-site diagnostic in Step 1 confirmed both the homepage-relative `previous` link resolution (`/catalogue/page-1.html`, distinct from `/index.html`) and the `.pager .current` text format ("Page N of 50") before any assertions were written, avoiding the URL-mismatch failure seen in an earlier trial of this same feature.

## Summary

The single-agent baseline produced 8 executable tests covering four self-assigned functional requirements: FR-01 (initial page load and pagination indicator), FR-02 (next-page navigation, content refresh, and multi-step advancement), FR-03 (previous-page navigation and its absence on page 1), and FR-04 (boundary behaviour at the last page and beyond, including a direct 404 check for an out-of-range page). Selectors (`li.next a`, `li.previous a`, `.pager .current`, `article.product_pod`, `.page-header h1`) were all confirmed against the live site before use, and all tests passed on the first run.

What it missed, by construction of being a single undifferentiated pass: there was no separate specification step to independently enumerate the site's routing and pagination-text conventions before implementation — the same agent that discovered selectors also wrote the assertions and FR list, so there is no independent check that the FRs match a business-level definition of "navigate to the next page" beyond what was directly observed. The test set also does not verify that repeated "next" clicks all the way to page 50 land exactly at the boundary (only pages 1→2→3 are exercised), does not check book count/ordering consistency across the full 50-page catalogue, and omits accessibility attributes of the pager, keyboard-only navigation, and interaction between pagination state and other page state (e.g. sort order or category filters). Coverage and fault categories remain narrower than what a role-decomposed pipeline would produce, since no independent stakeholder verified requirements coverage separately from the agent that wrote the implementation and assertions.
