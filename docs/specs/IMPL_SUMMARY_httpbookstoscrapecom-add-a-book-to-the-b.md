# Implementation Summary: httpbookstoscrapecom-add-a-book-to-the-b

## Application Under Test
- **Name**: Books to Scrape (Sandbox)
- **URL**: http://books.toscrape.com
- **Type**: Existing public static demo site (no server-side application logic). No test app setup required.

## What Was Built / Set Up
No test application code was built — this is a live, publicly hosted static site. The Developer instead performed a live investigation of the site's rendered HTML and runtime behaviour (via `curl` for raw source, comparison across multiple product pages, and a headless Playwright/Chromium diagnostic for live-click behaviour) to determine which parts of the Functional Spec are actually testable.

**Critical finding that reshapes the FR set**: the site is a fully static HTML export of a Django-Oscar e-commerce demo. It has **no backend**, **no cookies/session**, and **no server-side basket**. Concretely:

1. **The individual product detail page (`.product_main`) has NO "Add to basket" control at all.** Confirmed on two separate product pages (`a-light-in-the-attic_1000` and `soumission_998`) — the `.product_main` block contains only title, price, stock text, star rating, and a warning banner. No `<form>`, no `<button>`, no quantity input anywhere in that section.
2. **"Add to basket" buttons only exist on book *grid tiles*** (`article.product_pod`), which appear on: the homepage, category listing pages, and the "Products you recently viewed" carousel that appears near the bottom of *some* product pages (not the first-visited one, since there is nothing to have "recently viewed" yet — this section is static/pre-baked per page, not session-driven; confirmed no `Set-Cookie` header is ever sent and a fresh cookie jar produces identical output).
3. **Clicking "Add to basket" does not add anything to a basket.** Each button lives inside a bare `<form>` with no `action` and no `method` attribute, and the button itself has no `name`/`value`. Per HTML defaults this submits a `GET` to the current document URL. Live-click verification (headless Chromium) confirmed: clicking it simply reloads the current page, changing the URL only by appending an empty query string (e.g. `soumission_998/index.html` → `soumission_998/index.html?`). No confirmation message, no basket counter, no basket page.
4. **No basket page exists**: `http://books.toscrape.com/basket/` → HTTP 404.
5. **No quantity input field exists anywhere** on the site (product page or grid tiles).
6. **No JS/console errors occur on click** — verified via Playwright `pageerror`/`console` listeners during the live click; zero errors recorded.
7. The site's bundled `oscar/js/ui.js` does contain a real `o.basket` submit-handler (bound to `#basket_formset`), but the forms rendered on this static export have no `id`, so that handler never attaches — confirming the add-to-basket wiring is dead code on this static export.

Given these findings, this feature's testable surface is much narrower than the Functional Spec assumed, and several FRs must be flagged **NOT TESTABLE** or **NOT APPLICABLE** per the Functional Spec's own instruction to do so rather than assert against non-existent behaviour.

## File Changes
| File | Change Type | Description |
|------|-------------|--------------|
| docs/specs/IMPL_SUMMARY_httpbookstoscrapecom-add-a-book-to-the-b.md | Overwritten | Replaces a prior draft of this file whose TS numbering (up to TS-18) did not match the current Functional Spec (TS-01–TS-12); this version is re-derived directly from the current FUNCTIONAL_SPEC and fresh live verification. |

No application/test source files were created — target is a live external site; the Tester will add Playwright spec files as its own deliverable.

## FR Coverage
| FR | How It Is Implemented / Verified |
|----|-----------------------------------|
| FR-01 | **NOT TESTABLE as originally worded** (the product *detail* page never has an "Add to basket" control). **Redirected/testable scope**: the control IS present, visible, and enabled on catalogue/homepage grid tiles (`article.product_pod`). Tester should write TS-01 against a grid tile (homepage or category page), not the detail page. |
| FR-02 | **NOT TESTABLE.** No confirmation message, basket counter, or basket page exists anywhere on the site. The only observable effect of a click is a full page reload of the current URL with an appended empty query string (`?`). This reload behaviour itself is deterministic and reproducible (verified twice) and may be substituted as the "defined observable outcome" for TS-02, but it is not a basket confirmation. |
| FR-03 | **NOT TESTABLE** — depends on FR-02's confirmation mechanism, which does not exist. |
| FR-04 | **NOT TESTABLE** — no basket/quantity state is ever surfaced post-click. |
| FR-05 | **NOT APPLICABLE** — no quantity selector exists on the product page or anywhere on the site. Scenario 5, TS-05/TS-06/TS-07 must be skipped. |
| FR-06 | **Partially testable.** The repeat/rapid-click outcome IS deterministic: every click (single or rapid) reloads the current page to itself with no error and no state change (there is no basket to increment or duplicate into). Tester can assert "same reload behaviour, no error, no duplication" but cannot assert an incrementing basket. |
| FR-07 | **Testable.** Verified the identical mechanism (bare `<form>`, self-GET reload, no error) on two different books from two different categories: "A Light in the Attic" (Poetry) via homepage tile, and "Soumission" (Fiction) via its own recently-viewed tile / category page tile. Selector and behaviour are consistent across both. |
| FR-08 | **Testable — confirmed.** Live Playwright diagnostic attached `page.on('pageerror')` and `page.on('console')` listeners and clicked "Add to basket"; zero errors were recorded, and the page remained rendered (it reloads itself, which is a valid non-blank state). |
| FR-09 | **Partially testable.** Navigating away and back produces no error (testable). The "basket entry count does not increase" portion is **NOT TESTABLE** since no basket count is ever observable in the first place. |

## Confirmed Element Selectors
| FR | Selector | Type | Notes |
|----|----------|------|-------|
| FR-01, FR-07 | `article.product_pod` | container | One per book on homepage, category pages, and "recently viewed" carousel. Repeats identically across all listing contexts. |
| FR-01, FR-02, FR-06, FR-07, FR-08 | `article.product_pod form button.btn.btn-primary.btn-block` (text: exactly `Add to basket`) | button (`type="submit"`) | `data-loading-text="Adding..."` attribute present; no `id`, no `data-test`/`data-testid`. Not disabled on render. Parent `<form>` has no `action`/`method` attributes. |
| FR-03, FR-07 | `article.product_pod h3 a` | link/text | `title` attribute holds the FULL book title (e.g. `title="A Light in the Attic"`); visible link text is truncated with ellipsis (e.g. `A Light in the ...`) — Tester should assert against the `title` attribute, not innerText, for exact title matching. |
| FR-01 (detail page context, informational only) | `.product_main h1` | heading | Full, untruncated book title — present on the product *detail* page only (used for TS-03-style comparisons if repurposed; there is no add-to-basket control on this page, so this selector cannot be combined with a same-page click in the way FR-03 originally intended). |
| Informational | `.product_main p.price_color` | text | Price, e.g. `£51.77`, exists on detail page only. |
| Informational | `.product_main p.instock.availability` | text | Full stock text with count, e.g. `In stock (22 available)`, detail page only. |
| Informational | `article.product_pod p.instock.availability` | text | Grid tile stock text has NO count, e.g. just `In stock` (no parenthetical). Differs from detail-page version — do not assume identical text across contexts. |
| N/A | Quantity input | — | **Does not exist anywhere on the site.** Confirmed by full-page grep on both sampled product pages and grid tiles. |
| N/A | Basket page | — | `http://books.toscrape.com/basket/` returns HTTP 404. No basket view exists. |
| N/A | Confirmation message region | `#messages` | Exists in DOM on every page (`<div id="messages"></div>`) but is **always empty** — confirmed via live Playwright inspection before and after a click. No JS ever populates it in this static export. |

## Test Data Confirmed
| Label | Value | Notes |
|-------|-------|-------|
| Primary book | "A Light in the Attic" | First book on homepage; URL: `http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html`; category: Poetry; price £51.77; stock "In stock (22 available)" |
| Secondary book | "Soumission" | URL: `http://books.toscrape.com/catalogue/soumission_998/index.html`; category: Fiction (distinct from Poetry); price confirmed present; used for FR-07 cross-product check |
| Add-to-basket click target (primary) | Homepage grid tile for "A Light in the Attic" — `http://books.toscrape.com/index.html`, first `article.product_pod` | Since the detail page itself has no button, tests targeting FR-01/02/06/07/08 must click from a listing page, not the detail page |
| Invalid quantities (0, -1, "abc", "") | N/A | Not usable — no quantity field exists. FR-05 scenarios must be skipped, not failed. |

## Known Application Behaviour / Quirks
- This is a **static, unauthenticated, cookie-free HTML export** of a demo Django-Oscar storefront — there is no live backend behind "Add to basket." Treat every "basket" interaction as cosmetic.
- The "Add to basket" control's *placement* is inconsistent by design: it never appears on a book's own detail page, only on grid/tile renderings of that book (homepage, category listing, or another product's "recently viewed" carousel). Tests must be written against tile contexts, not detail pages, for any click-based scenario.
- The "Products you recently viewed" section is not actually session/cookie driven (verified: no `Set-Cookie` header, and repeated fetches with a persisted cookie jar return byte-identical output) — it is static content baked into the page at generation time and will not change based on real browsing history during test runs. It is present on `soumission_998` but absent on `a-light-in-the-attic_1000` in this export, so do not assume it exists on every product page.
- Clicking "Add to basket" triggers a same-page GET reload (URL gains a trailing `?`) with no measurable state change, no confirmation, and no errors. This is fully reproducible and safe to assert on for "no crash / no error" style tests (FR-06, FR-08, FR-09), but must not be asserted as a basket confirmation (FR-02/FR-03/FR-04 are not testable).
- No `data-test`, `data-testid`, or `id` attributes exist on any interactive element relevant to this feature. Selectors must rely on class names (`.product_pod`, `.btn.btn-primary.btn-block`) and text content (`Add to basket`, and the `title` attribute on tile links for exact book titles).
- Star ratings (`p.star-rating <Word>`) and review counts are explicitly randomised per the site's own on-page disclaimer ("Prices and ratings here were randomly assigned and have no real meaning") — do not use them as functional test data.

## Testing Notes
- **Environment**: Public URL, no local server or setup needed. Tests can run directly against `http://books.toscrape.com`.
- **Recommended scope for Tester**: Only implement Playwright scripts for scenarios confirmed testable above — TS-01 (redefined to target grid tiles), TS-02 (redefined to assert the deterministic self-reload, not a basket confirmation), TS-08/TS-09 (repeat/rapid click → same reload, no error, no duplication), TS-10 (cross-product consistency via two tiles), TS-11 (no console/JS errors), and the error-free-navigation half of TS-12. TS-03, TS-04, TS-05, TS-06, TS-07 should be **skipped** and reported as NOT TESTABLE / NOT APPLICABLE by the Tester and Evaluator, per the Functional Spec's own instruction — do not fabricate assertions against a confirmation or quantity system that does not exist.
- No authentication, no test data setup/teardown, and no basket state persists between runs (nothing is ever persisted in the first place).

Implementation summary complete. Saved to docs/specs/IMPL_SUMMARY_httpbookstoscrapecom-add-a-book-to-the-b.md. @tester please generate test cases and Playwright scripts.
