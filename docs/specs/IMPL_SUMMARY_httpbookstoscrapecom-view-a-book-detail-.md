# Implementation Summary: httpbookstoscrapecom-view-a-book-detail-

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Existing test app — static HTML demo book catalogue (web scraping sandbox; no authentication required)

## What Was Built / Set Up
No application code was built — this is a public, pre-existing static demo site used as the System Under Test. Verification consisted of fetching the live HTML for the homepage, the catalogue's first book detail page (`a-light-in-the-attic_1000`), and a second book detail page with an apostrophe in its title (`its-only-the-himalayas_981`) using `curl`, then parsing the raw markup with `python3`/`re` to confirm every selector, class name, table structure, and text string referenced in the functional spec. The site is plain server-rendered HTML with no client-side JS rendering — no browser-based Playwright diagnostic was required; all selectors below are confirmed directly from raw HTML source fetched on 2026-07-02.

## File Changes
| File | Change Type | Description |
|------|-------------|--------------|
| (none) | N/A | No source files were created or modified; AUT is an external public site |

## FR Coverage
| FR | How It Is Implemented / Verified |
|----|-----------------------------------|
| FR-01 | Confirmed `<h1>A Light in the Attic</h1>` inside `.product_main` on the detail page; confirmed a second book's `<h1>` renders `It&#39;s Only the Himalayas` in raw source, which decodes to the literal apostrophe `It's Only the Himalayas` in the rendered DOM/`textContent` |
| FR-02 | Confirmed `<p class="price_color">£51.77</p>` present both in `.product_main` on the detail page and in `.product_pod` on the homepage for the same book — values are identical (`£51.77` = `£51.77`) |
| FR-03 | Confirmed `<p class="instock availability">...In stock (22 available)...</p>` inside `.product_main` on the detail page, including the parenthesised numeric copy count |
| FR-04 | Confirmed `<div id="product_description" class="sub-header"><h2>Product Description</h2></div>` immediately followed by a sibling `<p>` containing the full synopsis text (`#product_description ~ p` matches) |
| FR-05 | Confirmed `<p class="star-rating Three">` inside `.product_main`, with rating word as the second space-separated class token (matches spec pattern `star-rating <One\|Two\|Three\|Four\|Five>`) |
| FR-06 | Confirmed `<table class="table table-striped">` with exactly 7 `<tr>` rows in order: UPC, Product Type, Price (excl. tax), Price (incl. tax), Tax, Availability, Number of reviews — all `th`/`td` pairs present and populated |
| FR-07 | Confirmed `.product_pod h3 a` has `href="catalogue/a-light-in-the-attic_1000/index.html"` and `title="A Light in the Attic"` (full title); clicking navigates to a URL matching `/catalogue/<slug>_<id>/index.html`, and the resulting page's `<h1>` text equals the `title` attribute value |
| FR-08 | Confirmed `<div class="item active"><img src="../../media/cache/fe/72/fe72f0532301ec28892ae79a629a293c.jpg" alt="A Light in the Attic" /></div>` present on the detail page; confirmed the resolved image URL (`http://books.toscrape.com/media/cache/fe/72/fe72f0532301ec28892ae79a629a293c.jpg`) returns HTTP 200 with a non-zero byte payload (31,047 bytes) |

## Confirmed Element Selectors
| FR | Selector | Type | Notes |
|----|----------|------|-------|
| FR-01 | `.product_main h1` | `<h1>` | No CSS class on the `<h1>` itself; it is the sole heading directly inside `div.col-sm-6.product_main` — selector matches spec exactly |
| FR-02 | `.product_main p.price_color` | `<p>` | Text e.g. `£51.77`, matches `^£\d+\.\d{2}$` exactly; identical value also appears via `.product_pod p.price_color` on the catalogue page for cross-page comparison |
| FR-03 | `.product_main p.instock.availability` | `<p>` | Actual class attribute is two tokens: `class="instock availability"` — compound selector `.instock.availability` matches; text is `\n    In stock (22 available)\n` — **trim whitespace before asserting** |
| FR-04 | `#product_description ~ p` | `<p>` | General sibling selector; the description `<p>` is a sibling of `div#product_description` within the same parent container, appearing immediately after it |
| FR-05 | `.product_main .star-rating` | `<p>` | Class attribute format `class="star-rating Three"` — rating word is the second space-separated class token; element appears exactly once per detail page |
| FR-06 | `table.table-striped` | `<table>` | Actual class attribute is `class="table table-striped"` — compound-token selector still matches; contains exactly 7 `<tr>` rows in fixed order (row 2 is "Product Type", not part of the spec's 6 named FR-06 fields but present in the table and does not disrupt `nth-child` indexing used for the other rows) |
| FR-06 | `table.table-striped tr:nth-child(1) td` | `<td>` | UPC value, e.g. `a897fe39b1053632` — non-empty alphanumeric |
| FR-06 | `table.table-striped tr:nth-child(3) td` | `<td>` | Price (excl. tax), e.g. `£51.77` |
| FR-06 | `table.table-striped tr:nth-child(4) td` | `<td>` | Price (incl. tax), e.g. `£51.77` |
| FR-06 | `table.table-striped tr:nth-child(5) td` | `<td>` | Tax, e.g. `£0.00` |
| FR-06 | `table.table-striped tr:nth-child(6) td` | `<td>` | Availability, e.g. `In stock (22 available)` |
| FR-06 | `table.table-striped tr:nth-child(7) td` | `<td>` | Number of reviews, e.g. `0` — confirmed non-negative integer |
| FR-07 | `.product_pod h3 a` | `<a>` | `href` is a relative path `catalogue/<slug>_<id>/index.html`; `title` attribute holds the FULL untruncated title — **use the `title` attribute as source-of-truth for the pre-click title, not the visible (possibly truncated) link text** |
| FR-07 | `.product_pod .image_container img` | `<img>` (wrapped in `<a>`) | The `<img>` itself is not a link — the surrounding `<a href="catalogue/.../index.html">` wraps the image; click target should be the `<img>` element, Playwright's `.click()` on the image will trigger the parent anchor's navigation |
| FR-08 | `div.item.active img` | `<img>` | `src` attribute uses a relative path with `../../` prefix (e.g. `../../media/cache/fe/72/....jpg`); resolves correctly when the page is loaded at its full detail-page URL; confirmed HTTP 200 and non-zero payload for the sampled image |
| N/A | `.breadcrumb` | `<ul>` | Actual class attribute is `class="breadcrumb"` (single token); last `<li class="active">` contains the current book's title text — useful for confirming page context but not required by any FR assertion |

## Test Data Confirmed
| Label | Value | Notes |
|-------|-------|-------|
| Target book (default) | "A Light in the Attic" | `http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html`, HTTP 200 |
| Target book price | `£51.77` | Identical on homepage `.product_pod` and detail page `.product_main` |
| Target book availability | `In stock (22 available)` | Numeric count present and > 0 |
| Target book rating | `star-rating Three` | Valid rating word |
| Target book UPC | `a897fe39b1053632` | Row 1 of product info table |
| Target book tax | `£0.00` | Row 5 of product info table |
| Target book reviews count | `0` | Row 7 of product info table — valid non-negative integer, confirms the "0 is a legitimate value" pattern used elsewhere in FR-06 |
| Target book cover image | `media/cache/fe/72/fe72f0532301ec28892ae79a629a293c.jpg` | Confirmed HTTP 200, 31,047 bytes |
| Special-character title book | "It's Only the Himalayas" | `http://books.toscrape.com/catalogue/its-only-the-himalayas_981/index.html`, HTTP 200; raw HTML source contains `It&#39;s Only the Himalayas`, decodes to a literal apostrophe in the rendered DOM |
| Detail page URL pattern | `/catalogue/<book-slug>_<id>/index.html` | Confirmed for both sampled books |

## Known Application Behaviour / Quirks
- **HTML-entity-encoded apostrophes**: Raw server HTML encodes apostrophes as `&#39;` (e.g. `It&#39;s Only the Himalayas`). This is standard HTML entity encoding, not a bug — Playwright's `textContent()`/`innerText()` (and any real browser DOM) will return the decoded literal apostrophe `'`. Tests asserting on the exact title string should compare against the literal-apostrophe form, not the raw HTML-entity form.
- **No genuine out-of-stock or zero-availability book found in the live dataset**: Sampled catalogue pages 1, 10, 25, 40, and 50 (of 50 total) via `curl` returned zero matches for "out of stock" text and zero matches for "(0 available)". This is consistent with the known behaviour of this demo dataset — all 1000 books are seeded as "In stock" with varying positive copy counts. **TS-08 (zero-availability distinction) cannot be satisfied against a live book page** — the Tester should either mark this scenario as not executable against live data, or use `page.route()`/DOM injection to simulate an "In stock (0 available)" state for the assertion-parsing logic itself, since the underlying requirement (distinguishing `count === 0` from `count === null`) is a parsing-logic test, not strictly a live-page presence test.
- **No confirmed short/boilerplate description found**: Both sampled books have substantial (150+ character) Lorem-Ipsum-style synopsis text. No unusually short description was found in the sampled pages. Since FR-04's validation rule only requires non-empty presence (no minimum length), TS-11 can be satisfied using the same target book as TS-10 without needing to locate a genuinely short description — the "short description" framing in the test scenario is a documentation nuance, not a hard data dependency.
- **`table.table-striped` contains 7 rows, but only 6 are named in the FR-06 spec text**: The table's second row is "Product Type" (value: `Books`), which sits between UPC (row 1) and "Price (excl. tax)" (row 3). This does not break the spec's `nth-child` indices given in the UI Elements table (rows 1, 3, 4, 5, 6, 7 map correctly to UPC, Price excl., Price incl., Tax, Availability, Number of reviews) — row 2 (Product Type) is simply not asserted on, by design.
- **Class attributes use multi-token values throughout**: `price_color`, `instock availability`, `star-rating Three`, `table table-striped`, and `item active` are all multi-token class attributes. All CSS selectors specified in the functional spec (e.g. `p.instock.availability`, `table.table-striped`, `div.item.active`) use compound-class syntax and match correctly against these multi-token attributes — no selector adjustments were needed.
- **Image `src` uses relative paths**: On the detail page, the gallery image `src` is `../../media/cache/<hash>/<hash>.jpg` (relative, two directories up from `/catalogue/<slug>_<id>/`). This resolves correctly only when the page is loaded at its actual nested URL — Playwright's rendered-DOM `naturalWidth`/`naturalHeight` checks handle this resolution automatically; no special handling needed for `page.goto()`-based tests, but any raw `src`-string equality check should not expect an absolute URL.
- **Site is entirely static, server-rendered HTML**: No client-side JS rendering, no lazy loading, no modals/overlays on any in-scope page. `page.goto()` followed by `domcontentloaded` is sufficient; `networkidle` is harmless but not required.
- **`.product_pod h3 a` visible text is truncated with `...` for long titles**, but the `title` attribute always holds the full untruncated title (consistent with the prior browse-catalogue feature's IMPL_SUMMARY finding) — FR-07's cross-page title comparison must use the `title` attribute as the pre-click source of truth, then compare against the post-click `<h1>` text as specified in the functional spec's FR-07 validation rules.

## Testing Notes
- **Environment**: Public live URL, no local server needed; tests can run directly against `http://books.toscrape.com` from any environment with outbound internet access.
- **No setup steps required**: no test accounts, no seed data, no auth tokens.
- Recommended target book for default (positive-path) scenarios: **"A Light in the Attic"** (`catalogue/a-light-in-the-attic_1000/index.html`), reachable as the first `.product_pod` on the homepage.
- Recommended target book for the FR-01 special-character boundary scenario (TS-02): **"It's Only the Himalayas"** (`catalogue/its-only-the-himalayas_981/index.html`), confirmed present on homepage page 1.
- All selectors, status codes, and text strings documented above were confirmed directly against live HTTP responses on 2026-07-02 using `curl` and `python3` HTML parsing; no selector remains unconfirmed except the TS-08 zero-availability live data point, which is flagged above as not present in the current dataset.

Implementation summary complete. Saved to docs/specs/IMPL_SUMMARY_httpbookstoscrapecom-view-a-book-detail-.md. @tester please generate test cases and Playwright scripts.
