# Implementation Summary: httpbookstoscrapecom-filter-books-by-the

## Application Under Test
- **Name**: Books to Scrape (books.toscrape.com)
- **URL**: http://books.toscrape.com
- **Type**: Existing test app — static, server-rendered HTML site (no JavaScript framework, no auth, no cart/checkout interaction required for this feature). All pages were fetched and inspected directly via `curl` against the live site; every selector below reflects the actual rendered HTML, not an assumption.

## What Was Built / Set Up
No application code was written — this feature only requires read-only Playwright tests against the public, static Books to Scrape site. The Developer's job here was to confirm the real DOM structure and URLs for the Mystery category filtering flow so the Tester can write reliable selectors. All selectors listed in the Functional Spec's UI Elements table were verified against the live HTML and are confirmed accurate as written, with two clarifications noted under "Known Application Behaviour / Quirks" below (sidebar class name detail, and sidebar absence on product detail pages).

## File Changes
| File | Change Type | Description |
|------|-------------|--------------|
| docs/specs/IMPL_SUMMARY_httpbookstoscrapecom-filter-books-by-the.md | Created | This document |

No test app source files were modified; Books to Scrape is a third-party live site.

## FR Coverage
| FR | How It Is Implemented / Verified |
|----|-----------------------------------|
| FR-01 | Confirmed via `curl http://books.toscrape.com/`: sidebar contains `<div class="side_categories"><ul class="nav nav-list">` with a nested `<li><a href="catalogue/category/books/mystery_3/index.html">Mystery</a></li>`, alongside "Travel", "Crime", "Thriller", "Historical Fiction", etc. Exact link text is "Mystery" (surrounding whitespace only). Also confirmed present on the Mystery category page itself and on other category pages (see Quirks — **not** present on product detail pages). |
| FR-02 | Confirmed via `curl` of `/catalogue/category/books/mystery_3/index.html`: `<div class="page-header action"><h1>Mystery</h1></div>`. Heading text is exactly `"Mystery"`. |
| FR-03 | Confirmed 32 total Mystery results across 2 pages: page 1 has 20 `article.product_pod` items, page 2 (`page-2.html`) has 12. All are scoped under the `mystery_3` category path; no cross-category pod IDs observed. No live zero-result category was found (see Quirks). |
| FR-04 | Confirmed results text on page 1: `<strong>32</strong> results - showing <strong>1</strong> to <strong>20</strong>.` inside `<form method="get" class="form-horizontal">`. 32 = 20 (page 1) + 12 (page 2), confirmed by direct count. |
| FR-05 | Confirmed structure of `article.product_pod`: title in `<h3><a href="..." title="Sharp Objects">Sharp Objects</a></h3>`, price in `<p class="price_color">£47.82</p>`, availability in `<p class="instock availability"><i class="icon-ok"></i> In stock </p>`. Verified across multiple pods on page 1. |
| FR-06 | Confirmed clicking a title link (e.g. `sharp-objects_997/index.html`) leads to a product detail page with `<div class="col-sm-6 product_main"><h1>Sharp Objects</h1>`, exactly matching the listing title. |
| FR-07 | Confirmed direct navigation to `http://books.toscrape.com/catalogue/category/books/mystery_3/index.html` (without visiting homepage first) returns the identical page — same `<h1>Mystery</h1>`, same `32 results` count, same first-page book set. Re-navigating to the same URL is idempotent (static page, no server-side state). |

## Confirmed Element Selectors
| FR | Selector | Type | Notes |
|----|----------|------|-------|
| FR-01 | `.side_categories ul.nav.nav-list li ul li a` (filter to exact text "Mystery") | link | Actual class attribute is `class="nav nav-list"` (two classes). The spec's `ul.nav-list` selector still matches correctly since CSS class selectors match individual tokens. `href="catalogue/category/books/mystery_3/index.html"` (relative; resolves correctly from homepage and from other category pages). Use Playwright's `getByRole('link', { name: 'Mystery', exact: true })` scoped to `.side_categories` to avoid ambiguity with breadcrumb "Mystery" text elsewhere on category pages. |
| FR-02 | `.page-header.action h1` | heading | Confirmed exact text `Mystery`. |
| FR-04 | `.form-horizontal strong >> nth=0` (first `<strong>` inside the results form) | text | Confirmed text `32` on page 1. The same form contains two more `<strong>` tags for "showing X to Y" — the results total is always the **first** `<strong>` in `form.form-horizontal`. |
| FR-03/FR-05 | `ol.row li article.product_pod` | list item (repeated) | 20 instances on page 1, 12 on page 2. |
| FR-05/FR-06 | `article.product_pod h3 a` | link | `title` attribute holds full untruncated book title (visible link text can be CSS-truncated with ellipsis on narrow viewports, but `title` attribute always holds the full string — prefer asserting against `title` attribute for reliability). |
| FR-05 | `article.product_pod .price_color` | text | Format confirmed: `£` immediately followed by a decimal number, e.g. `£47.82`. |
| FR-05 | `article.product_pod .instock.availability` | text | Confirmed text content `In stock` (with a leading `<i class="icon-ok">` icon and surrounding whitespace/newlines — use `.textContent()` trimmed, or Playwright's `toContainText('In stock')`). |
| FR-03 | `.pager .next a` | link | Confirmed present on page 1 only (2 total pages). `href="page-2.html"` (relative to current category directory). Not present on page 2 (last page) — absence confirms end of pagination, consistent with TS-08 reasoning applied to the *last* page rather than a single-page category. |
| FR-06 | `.product_main h1` | heading | Confirmed exact match to source listing title, e.g. `Sharp Objects`. |
| FR-07 | `http://books.toscrape.com/catalogue/category/books/mystery_3/index.html` | page/route | **Confirmed exact path** — matches the pattern anticipated in the Functional Spec exactly. Page 2 is reachable at `http://books.toscrape.com/catalogue/category/books/mystery_3/page-2.html`. |
| FR-06 (supplementary, for TS-04) | `.breadcrumb li:nth-child(3)` on the product detail page | text | Not in the original spec's UI Elements table but confirmed useful: on a product detail page (e.g. `/catalogue/sharp-objects_997/index.html`), the breadcrumb's 3rd `<li>` links back to the book's own category (e.g. `<a href="../category/books/mystery_3/index.html">Mystery</a>`). This gives an independent, server-confirmed per-book category value — exactly the mechanism TS-04 step 3 calls for ("cross-check each listing against the Mystery category... via each book's own category on its detail page"). |

## Test Data Confirmed
| Label | Value | Notes |
|-------|-------|-------|
| Mystery category URL | `http://books.toscrape.com/catalogue/category/books/mystery_3/index.html` | Confirmed exact, page 1 |
| Mystery category URL, page 2 | `http://books.toscrape.com/catalogue/category/books/mystery_3/page-2.html` | Confirmed exact, last page (no further `next` link) |
| Mystery total result count | `32` | Confirmed: 20 (page 1) + 12 (page 2) |
| Sample book (page 1, item 1) | Title: `Sharp Objects`, Price: `£47.82`, Availability: `In stock`, detail URL: `http://books.toscrape.com/catalogue/sharp-objects_997/index.html` | Use for TS-11/TS-12 title-matching assertions |
| Sample book (page 1, item 2) | Title: `In a Dark, Dark Wood`, Price: `£19.63`, Availability: `In stock` | Use as the "second listing" comparator for TS-12 (negative — must NOT match after clicking item 1) |
| Distractor category names | `Crime` (href `catalogue/category/books/crime_51/index.html`, 1 result), `Thriller` (href `catalogue/category/books/thriller_37/index.html`, 11 results) | Confirmed distinct hrefs and non-zero result counts, useful for TS-02 exact-match assertions |

## Known Application Behaviour / Quirks
- **Sidebar not present on product detail pages.** The category sidebar (`.side_categories`) renders on the homepage and on every category listing page, but a product detail page (e.g. `/catalogue/sharp-objects_997/index.html`) only shows a **breadcrumb** link (`<a href="../category/books/mystery_3/index.html">Mystery</a>` inside `.breadcrumb`), not the full sidebar list. TS-13 ("non-homepage page that still renders the category sidebar") should therefore target **another category listing page** (e.g. Travel, Crime, Thriller category pages all confirmed to include the sidebar) rather than a product detail page, or the Tester should adjust TS-13 to explicitly use the breadcrumb link if testing from a product page is desired.
- **No live zero-result Mystery-adjacent category was found.** Sampled categories: Crime = 1 result (smallest found), Thriller = 11, Travel = 11, Poetry = 19 — none returned 0. TS-05 (zero-results boundary) cannot use a real live URL as its proxy. Two options confirmed for the Tester:
  1. **Simulate via Playwright route interception** (`page.route()`) on the Mystery category URL, serving an empty book-list HTML fixture — gives full control over asserting a graceful "no results" UI state, but is a mock, not real site behaviour.
  2. **Use a genuinely nonexistent category URL** as a real-site boundary probe — confirmed via direct request that `http://books.toscrape.com/catalogue/category/books/nonexistent-category_999/index.html` returns a hard **HTTP 404** (`<title>404 Not Found</title>`), not an in-app "no books found" message. This means the live site does NOT satisfy FR-03's "must not error and must indicate no books were found" rule for the case of an unknown category — it errors at the HTTP level instead. Recommend the Tester document this as a confirmed spec/reality gap: assert the 404 response is well-formed and doesn't crash the browser context, rather than asserting an in-page empty-results message (which does not exist for this scenario on the live site).
- **Sidebar class is `class="nav nav-list"`**, not `nav-list` alone — does not change the validity of the spec's `.nav-list` selector but is worth noting for anyone hand-writing selectors from scratch.
- **Relative hrefs**: All internal links use relative paths that depend on directory depth (e.g. from the homepage: `catalogue/category/books/mystery_3/index.html`; from a category page linking to a product: `../../../sharp-objects_997/index.html`). This is transparent to Playwright when using `page.click()` / `page.getByRole('link').click()` since the browser resolves the relative path — no special handling needed, but do not assert on raw `href` string equality without resolving it first (use `new URL(href, page.url())` or assert on `page.url()` post-navigation instead).
- **Pagination link text** is lowercase `"next"` (not "Next") inside `<li class="next"><a href="page-2.html">next</a></li>`.

## Testing Notes
- Environment: Public live URL, no local server or test app needed. Tests should be run against `http://books.toscrape.com` directly. Confirm network availability before test execution, per the Functional Spec's Dependencies section.
- No setup, auth, or seed data required — site is fully static and stateless (GET-only navigation).
- Recommend setting Playwright `baseURL` to `http://books.toscrape.com` in `playwright.config.ts` so relative paths (`/catalogue/category/books/mystery_3/index.html`) can be used directly in `page.goto()`.
- Rate-limit consideration: this is a public demo/scraping-sandbox site; keep test run frequency reasonable and avoid unnecessary retries/polling to be a good citizen of the shared public host.

Implementation summary complete. Saved to docs/specs/IMPL_SUMMARY_httpbookstoscrapecom-filter-books-by-the.md. @tester please generate test cases and Playwright scripts.
