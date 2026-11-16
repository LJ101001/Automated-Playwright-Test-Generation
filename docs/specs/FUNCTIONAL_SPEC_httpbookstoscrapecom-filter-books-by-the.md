# Functional Specification: httpbookstoscrapecom-filter-books-by-the

## Source
docs/specs/USER_STORY_httpbookstoscrapecom-filter-books-by-the.md

## Application Under Test
Books to Scrape (http://books.toscrape.com) — static book catalogue demo/scraping-sandbox site, no authentication, no cart/checkout interaction required for this feature.

## Functional Requirements

### FR-01: Category navigation link is present and selectable
**Description**: The site-wide category sidebar must list "Mystery" as a distinct, selectable navigation link, available from the homepage and from every other page that renders the sidebar.
**Input**: User clicks the "Mystery" link inside the category navigation list.
**Expected Output / State Change**: Browser navigates to the Mystery category listing page (URL pattern `/catalogue/category/books/mystery_3/index.html` relative to the site root, or the exact path discovered by the Developer).
**Validation Rules**:
- The link text must be an exact match for "Mystery" (not "Crime", "Thriller", or any other category).
- The link must be present in the sidebar markup on the homepage and on at least one non-homepage page (e.g. another category page or a product detail page).
- Clicking the same link multiple times in succession must always resolve to the same Mystery category URL (idempotent navigation).

### FR-02: Mystery category page identifies itself correctly
**Description**: Once on the Mystery category page, the page must clearly and correctly identify itself as showing the Mystery category.
**Input**: Page load completes after navigating to the Mystery category URL.
**Expected Output / State Change**: The page heading element displays the text "Mystery".
**Validation Rules**:
- Heading text must equal "Mystery" exactly (case-sensitive, no extra category names appended).
- Heading must be present before any assertions are made about the book list (page fully loaded).

### FR-03: Only Mystery-category books are displayed in the results
**Description**: Every book shown on the Mystery category page must actually belong to the Mystery category; no books from other categories may appear.
**Input**: Rendered book list on the Mystery category page (and any subsequent pagination pages reached from it).
**Expected Output / State Change**: The full set of book listing items on the page corresponds only to Mystery-category books.
**Validation Rules**:
- If the category is empty (zero results), the page must not error and must indicate no books were found rather than showing a blank or broken list.
- The filter must persist across pagination — navigating to page 2, 3, etc. from within the Mystery category must continue to show only Mystery books, using the same category-scoped URL/pagination path.

### FR-04: Displayed result count matches the number of books shown
**Description**: The result-count indicator on the Mystery category page must accurately reflect the total number of Mystery books available (across all pages, if paginated).
**Input**: Page load of the Mystery category page (page 1).
**Expected Output / State Change**: A numeric "results" count is displayed near the page heading.
**Validation Rules**:
- The count must be a non-negative integer.
- The count must match the actual total number of book listings reachable for the Mystery category across all its paginated pages (sum of per-page listings, or the site's own reported total if pagination is present).
- If the count is zero, the page must still render without error and communicate zero results.

### FR-05: Each book listing preserves standard catalogue information
**Description**: Every book listing shown on the filtered Mystery page must display the same categories of information shown in the main (unfiltered) catalogue view: title, price, and in-stock availability.
**Input**: A rendered book listing item ("product pod") on the Mystery category page.
**Expected Output / State Change**: Each listing renders a non-empty title, a price in the expected currency format, and an availability/stock status string.
**Validation Rules**:
- Title text must be non-empty.
- Price must match the site's price format (e.g. `£` followed by a numeric value).
- Availability text must be present (e.g. contains "In stock" or an equivalent stock indicator consistent with the main catalogue).

### FR-06: Navigating from a filtered listing to product detail preserves accuracy
**Description**: Clicking a book title within the filtered Mystery results must lead to that exact book's product detail page, with matching title.
**Input**: Click on a book title link within the Mystery category listing.
**Expected Output / State Change**: Browser navigates to the corresponding product detail page.
**Validation Rules**:
- The product detail page's title/heading must exactly match the title shown in the filtered list item that was clicked.
- Navigation must not silently redirect to an unrelated product or the homepage.

### FR-07: Category filter is reachable via direct URL and repeated activation
**Description**: The Mystery category page must be reachable both through UI navigation and via direct URL access (e.g. bookmarked or guessed link), and must behave consistently when the filter is applied repeatedly.
**Input**: (a) Direct browser navigation to the known Mystery category URL without visiting the homepage first; (b) repeated clicks on the Mystery sidebar link from within the category page itself.
**Expected Output / State Change**: In both cases, the shopper ends up on the same, correctly filtered Mystery category page (per FR-02, FR-03, FR-04).
**Validation Rules**:
- Direct URL navigation must render the identical page a shopper would reach via the sidebar link (same heading, same result count, same book set).
- Re-clicking the Mystery link while already on the Mystery page must not error, duplicate content, or navigate elsewhere.

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---------------|-------------|-------------------|
| `.side_categories ul.nav-list li ul li a` (link with text "Mystery") | link | Navigates to the Mystery category listing page |
| `.page-header.action h1` | heading | Displays "Mystery" on the category page |
| `.form-horizontal strong` (results count, first `<strong>` in the form near the heading) | text/label | Displays the numeric count of Mystery results |
| `ol.row li article.product_pod` | list item (repeated) | One instance per book; contains title, price, availability |
| `article.product_pod h3 a` (`title` attribute holds full book title) | link | Book title; navigates to the book's product detail page |
| `article.product_pod .price_color` | text | Displays book price, e.g. "£53.74" |
| `article.product_pod .instock.availability` | text/icon | Displays stock status, e.g. "In stock" |
| `.pager .next a` | link | Navigates to the next page of Mystery results, preserving the category filter |
| `.product_main h1` | heading | Product detail page title, must match the source listing's title |
| Mystery category URL (exact path to be confirmed by Developer against the live site, expected pattern `/catalogue/category/books/mystery_3/index.html`) | page/route | Category-scoped, paginated listing endpoint for Mystery |

*Note: Books to Scrape has no `data-test` attributes; selectors above are the site's actual CSS classes/structure and should be confirmed/adjusted by the Developer against the live DOM before implementation.*

## Test Scenarios

### TS-01: Navigate to Mystery category from homepage sidebar [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Shopper is on the Books to Scrape homepage.
- **Test Data**: Category link text = "Mystery"
- **Steps**:
  1. Load the homepage.
  2. Locate the category navigation sidebar.
  3. Click the "Mystery" link.
- **Expected Result**: Browser navigates to the Mystery category page; URL changes to the Mystery category path.

### TS-02: Category link is exact match, not conflated with similarly named categories [FR-01]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Shopper is on the homepage; sidebar lists multiple categories including "Mystery", "Crime", "Thriller" (or similar).
- **Test Data**: Category link text = "Mystery" vs. adjacent category names
- **Steps**:
  1. Load the homepage.
  2. Assert exactly one sidebar link has the exact text "Mystery".
  3. Click that link.
- **Expected Result**: Navigation lands on the Mystery category page, not a page for any other category; heading confirms "Mystery".

### TS-03: Mystery category page heading identifies the category [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Shopper has navigated to the Mystery category page.
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Wait for page load to complete.
  3. Read the page heading text.
- **Expected Result**: Heading text equals "Mystery" exactly.

### TS-04: All displayed books belong to the Mystery category [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Shopper is on the Mystery category page with at least one result.
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Collect all book listing items on the page.
  3. Cross-check each listing against the Mystery category (e.g. via each book's own category on its detail page, or via consistent category-scoped URL for the listing).
- **Expected Result**: Every listed book is confirmed to belong to the Mystery category; no listings from other categories appear.

### TS-05: Mystery category with zero results does not error [FR-03]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Hypothetical/simulated state where the Mystery category has no books (or a category known to currently have zero results, if one exists on the live site, used as a boundary-condition proxy).
- **Test Data**: A category URL known/simulated to return zero results
- **Steps**:
  1. Navigate to the zero-result category page.
  2. Observe page rendering.
- **Expected Result**: Page loads without error and clearly indicates no books were found; no broken/empty list rendering.

### TS-06: Filter persists across pagination [FR-03]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Mystery category has enough results to span multiple pages.
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Click the "next" pagination control.
  3. Repeat until the last page or at least one additional page has been visited.
- **Expected Result**: Every subsequent page continues to show only Mystery-category books and retains the "Mystery" heading.

### TS-07: Displayed result count matches actual number of books shown [FR-04]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Shopper is on the Mystery category page (page 1).
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Read the displayed results count.
  3. Count actual book listings across all pages of the Mystery category.
- **Expected Result**: Displayed count equals the total counted book listings.

### TS-08: Result count boundary when only a single page of results exists [FR-04]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Mystery category total results are less than or equal to one page's worth of listings (no pagination control present).
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Verify no pagination control is rendered.
  3. Compare displayed count to the number of listings on the single page.
- **Expected Result**: Count matches exactly; absence of pagination is consistent with the count.

### TS-09: Each book listing shows title, price, and availability [FR-05]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Shopper is on the Mystery category page with at least one result.
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Inspect the first book listing.
- **Expected Result**: Listing shows a non-empty title, a correctly formatted price, and an availability/in-stock indicator.

### TS-10: Listing information is malformed or missing on a book [FR-05]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Shopper is on the Mystery category page.
- **Test Data**: N/A (assert absence of malformed data rather than injecting it, since the site is read-only)
- **Steps**:
  1. Navigate to the Mystery category page.
  2. For every listing, assert title is non-empty, price matches expected currency format, and availability text is present.
- **Expected Result**: No listing is found with an empty title, malformed price, or missing availability text; test fails loudly if one is found.

### TS-11: Clicking a book title from filtered results opens matching product detail page [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Shopper is on the Mystery category page with at least one result.
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Record the title text of the first book listing.
  3. Click that book's title link.
- **Expected Result**: Product detail page loads; its title/heading matches the recorded title exactly.

### TS-12: Product detail navigation does not leak to an unrelated product [FR-06]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Shopper is on the Mystery category page with at least two results.
- **Test Data**: Titles of first and second book listings
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Record titles of the first and second listings.
  3. Click the first listing's title link.
- **Expected Result**: Resulting product detail page title matches the first listing's recorded title, not the second's.

### TS-13: Category sidebar filter reachable from any page [FR-01]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Shopper is on a page other than the homepage that still renders the category sidebar (e.g. a different category page or a product detail page).
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a non-homepage page that includes the sidebar.
  2. Click the "Mystery" sidebar link.
- **Expected Result**: Shopper is taken to the Mystery category page regardless of the starting page.

### TS-14: Direct URL navigation to the Mystery category page [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Browser has no prior navigation history / starts at the direct Mystery category URL.
- **Test Data**: Mystery category URL (as confirmed by Developer)
- **Steps**:
  1. Navigate directly to the Mystery category URL without visiting the homepage.
- **Expected Result**: Page renders identically to reaching it via the sidebar — correct heading, correct result count, correct book set.

### TS-15: Repeated activation of the Mystery filter is idempotent [FR-07]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Shopper is already on the Mystery category page.
- **Test Data**: N/A
- **Steps**:
  1. Navigate to the Mystery category page.
  2. Click the "Mystery" sidebar link again (while already on that page).
  3. Repeat a third time.
- **Expected Result**: Page remains on the same Mystery category page each time; no errors, duplicated content, or unexpected navigation occur.

## Test Data Summary

| Data Set | Values | Purpose |
|----------|--------|---------|
| Category names | "Mystery" (target), "Crime", "Thriller" (distractors) | Verify exact-match category selection, rule out conflation (TS-02) |
| Mystery category URL | `/catalogue/category/books/mystery_3/index.html` (to be confirmed by Developer) | Direct navigation test (TS-14) |
| Zero-result category (proxy) | A live category confirmed to have 0 books, if available; otherwise simulated/mocked boundary | Zero-results handling (TS-05) |
| Book listing fields | title (string), price (`£` + numeric), availability (string) | Field-level content assertions (TS-09, TS-10) |
| Pagination pages | Page 1..N of Mystery category | Filter persistence across pagination (TS-06) |

## Dependencies / Environment
- Live site availability: http://books.toscrape.com must be reachable during test execution (no authentication required).
- No test account or credentials needed.
- Category data is assumed static for the duration of testing; exact Mystery result count and total page count must be confirmed against the live site rather than hardcoded from assumption.
- Developer must confirm exact selectors/URLs against the live DOM before Playwright implementation, since Books to Scrape uses class-based CSS selectors rather than `data-test` attributes.
