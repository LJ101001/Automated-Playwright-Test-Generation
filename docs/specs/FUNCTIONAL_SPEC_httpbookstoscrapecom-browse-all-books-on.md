# Functional Specification: httpbookstoscrapecom-browse-all-books-on

## Source
docs/specs/USER_STORY_httpbookstoscrapecom-browse-all-books-on.md

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Static HTML demo book catalogue (web scraping practice site; no authentication required)

---

## Functional Requirements

### FR-01: Homepage Loads Successfully
**Description**: Navigating to http://books.toscrape.com must return a successful page load (HTTP 200) and render a visible book catalogue without JavaScript errors.
**Input**: HTTP GET to `http://books.toscrape.com`
**Expected Output / State Change**: Page renders fully; at least one `article.product_pod` element is present; no console error is thrown.
**Validation Rules**:
- HTTP response status must be 200
- At least one `article.product_pod` must be present in the DOM
- No uncaught JavaScript errors on load

---

### FR-02: Book Listing Displays Exactly 20 Items Per Page
**Description**: The homepage catalogue must render exactly 20 book items on the first page.
**Input**: Rendered homepage at root path `/`
**Expected Output / State Change**: Exactly 20 `article.product_pod` elements are rendered in the product listing area.
**Validation Rules**:
- Count of visible `article.product_pod` elements must equal exactly 20
- Items must not be hidden (`display:none`)
- No duplicate title/href pairs within the same page

---

### FR-03: Each Book Displays a Cover Image and Title
**Description**: Every book item must show a cover image thumbnail and a human-readable title that is also a clickable link.
**Input**: Rendered homepage with 20 book items visible
**Expected Output / State Change**: Each `article.product_pod` contains an `<img>` with a non-empty `src` and an `<h3><a>` element with non-empty link text.
**Validation Rules**:
- `img` `src` must be non-empty
- `h3 > a` text content (or `title` attribute) must be non-empty
- `h3 > a` must have a valid `href` pointing to a detail page
- No book item may be missing either element

---

### FR-04: Each Book Displays a Price in GBP Format
**Description**: Every book item must show a price formatted as a pound-sterling value with two decimal places.
**Input**: Rendered homepage listing
**Expected Output / State Change**: Each `article.product_pod` contains a `.price_color` element whose text matches `£\d+\.\d{2}`.
**Validation Rules**:
- Price text must match regex `^£\d+\.\d{2}$`
- Price element must be visible
- Numeric value after `£` must be parseable as a decimal number
- No book item may be missing a price element

---

### FR-05: Each Book Displays an Availability Status
**Description**: Every book item must show an availability label (e.g. "In stock" or "Out of stock").
**Input**: Rendered homepage listing
**Expected Output / State Change**: Each `article.product_pod` contains a `.availability` element with non-empty, visible text.
**Validation Rules**:
- `.availability` element must be present within each book item
- Text must be non-empty and visible
- Accepted values: "In stock" or "Out of stock" (case-insensitive)

---

### FR-06: Each Book Displays a Machine-Readable Star Rating
**Description**: Every book item must display a star rating between one and five stars, encoded machine-readably via a CSS class on the rating element.
**Input**: Rendered homepage listing
**Expected Output / State Change**: Each `article.product_pod` contains a `p.star-rating` element whose class list includes exactly one of: `One`, `Two`, `Three`, `Four`, `Five`.
**Validation Rules**:
- `p.star-rating` element must be present on every book item
- Class list must include one of the five valid rating words
- Rating must be determinable programmatically, not only visually

---

### FR-07: Pagination Controls Are Present and Functional
**Description**: Because the catalogue contains more than 20 books, a "next" pagination link must be visible on page 1 and allow forward navigation to page 2.
**Input**: Homepage load; then click on the "next" link
**Expected Output / State Change**: `li.next > a` is visible on page 1; clicking it navigates to a URL containing `page-2`; page 2 renders up to 20 book items; `li.previous` is absent on page 1 and present on page 2.
**Validation Rules**:
- `li.next > a` must be present and visible on page 1
- `li.previous` must be absent on page 1
- Clicking `li.next > a` must update the URL to contain `page-2`
- Page 2 must contain between 1 and 20 `article.product_pod` elements

---

### FR-08: Book Title/Image Links to a Detail Page
**Description**: Clicking any book's title anchor or cover image must navigate to that book's dedicated detail page under `/catalogue/`.
**Input**: Click on `article.product_pod h3 > a` or its parent anchor wrapping the cover image
**Expected Output / State Change**: Browser navigates to a URL containing `/catalogue/`; the detail page loads with HTTP 200.
**Validation Rules**:
- Target URL must contain `/catalogue/`
- Detail page must respond with HTTP 200
- Detail page must not be the homepage or a 404

---

### FR-09: Page Title and Site Heading Identify the Application
**Description**: The page `<title>` must be non-empty and descriptive; a visible site header or logo must identify the application.
**Input**: Rendered homepage
**Expected Output / State Change**: `document.title` is non-empty; a header element is visible in the viewport.
**Validation Rules**:
- `document.title` must contain the word "Books" (case-insensitive)
- Site header/logo element must be visible and non-empty

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---|---|---|
| `article.product_pod` | Article (book card) | Container for each book item; must appear exactly 20 times on page 1 |
| `article.product_pod h3 > a` | Anchor | Book title link; `title` attr holds full title; navigates to detail page on click |
| `article.product_pod img` | Image | Displays cover art; `src` must be non-empty and resolve without error |
| `article.product_pod .price_color` | Paragraph | Shows price as `£X.XX`; must match `^£\d+\.\d{2}$` |
| `article.product_pod .availability` | Paragraph | Shows "In stock" or "Out of stock"; must be non-empty |
| `article.product_pod p.star-rating` | Paragraph | CSS class includes rating word `One`–`Five` |
| `li.next > a` | Anchor (pagination) | "Next" link; present on page 1; absent on last page (page 50) |
| `li.previous > a` | Anchor (pagination) | "Previous" link; absent on page 1; present on pages 2–50 |
| `ul.pager` | List | Pagination container |
| `header` / `.site-logo` | Header | Site logo/name; visible at top of page |
| `title` (document) | HTML `<title>` | Non-empty, descriptive page title containing "Books" |

---

## Test Scenarios

### TS-01: Homepage Loads Successfully [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Network access to http://books.toscrape.com
- **Test Data**: URL = `http://books.toscrape.com`
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Wait for page to fully load (network idle)
  3. Assert at least one `article.product_pod` is present
  4. Assert no JavaScript console errors
- **Expected Result**: Page renders with HTTP 200; at least one book item is visible; no console errors

---

### TS-02: Invalid Path Returns No Catalogue [FR-01]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Network access available
- **Test Data**: URL = `http://books.toscrape.com/nonexistent-page`
- **Steps**:
  1. Navigate to `http://books.toscrape.com/nonexistent-page`
  2. Count `article.product_pod` elements
- **Expected Result**: Count of `article.product_pod` is 0; an error message or 404 indicator is shown

---

### TS-03: Exactly 20 Books Displayed on Page 1 [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded successfully
- **Test Data**: Homepage root `/`
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Count all `article.product_pod` elements
- **Expected Result**: Count equals exactly 20

---

### TS-04: Book Count Is Not 19 or 21 — Boundary [FR-02]
- **Type**: Boundary
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Expected count = 20
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Count `article.product_pod` elements
  3. Assert count is neither 19 nor 21
- **Expected Result**: Exactly 20 items — no more, no fewer

---

### TS-05: Every Book Has a Cover Image with Non-Empty Src [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: All 20 `article.product_pod img` elements
- **Steps**:
  1. Navigate to homepage
  2. For each `article.product_pod img`, assert `src` attribute is non-empty
- **Expected Result**: All 20 book images have a non-empty `src`; none are blank or broken placeholders

---

### TS-06: Every Book Has a Non-Empty Title Link [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: All 20 `article.product_pod h3 > a` elements
- **Steps**:
  1. Navigate to homepage
  2. For each `h3 > a`, assert text content (or `title` attribute) is non-empty
- **Expected Result**: All 20 items have a visible, non-empty book title

---

### TS-07: Book with Missing Title Detected [FR-03]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: All `article.product_pod h3 > a` elements
- **Steps**:
  1. Navigate to homepage
  2. For each `h3 > a`, assert `title` attribute or inner text is not an empty string
- **Expected Result**: Zero items have an empty or whitespace-only title; assertion passes for all 20

---

### TS-08: Every Book Shows a Valid GBP Price [FR-04]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: Regex = `/^£\d+\.\d{2}$/`; all 20 `.price_color` elements
- **Steps**:
  1. Navigate to homepage
  2. For each `.price_color`, read text content
  3. Assert text matches `^£\d+\.\d{2}$`
- **Expected Result**: All 20 prices match the GBP format regex

---

### TS-09: No Book Is Missing a Price Element [FR-04]
- **Type**: Negative
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: All 20 `article.product_pod` containers
- **Steps**:
  1. Navigate to homepage
  2. For each `article.product_pod`, assert `.price_color` child exists and is visible
- **Expected Result**: All 20 items contain a visible `.price_color` element; zero items fail

---

### TS-10: Price Numeric Value Is Greater Than Zero [FR-04]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Homepage loaded
- **Test Data**: All `.price_color` text values
- **Steps**:
  1. Navigate to homepage
  2. For each price, strip the `£` symbol and parse the remainder as a float
  3. Assert value > 0.00
- **Expected Result**: All prices are strictly greater than £0.00; no zero-price books

---

### TS-11: Every Book Shows an Availability Label [FR-05]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: All 20 `.availability` elements
- **Steps**:
  1. Navigate to homepage
  2. For each `article.product_pod`, assert `.availability` exists with non-empty text
- **Expected Result**: All 20 items have a non-empty availability label

---

### TS-12: No Book Is Missing an Availability Element [FR-05]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: All 20 `article.product_pod` containers
- **Steps**:
  1. Navigate to homepage
  2. For each `article.product_pod`, assert `.availability` child element is present
- **Expected Result**: Zero items are missing the `.availability` element

---

### TS-13: Every Book Has a Machine-Readable Star Rating [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: Valid rating classes = `["One", "Two", "Three", "Four", "Five"]`
- **Steps**:
  1. Navigate to homepage
  2. For each `article.product_pod p.star-rating`, read class list
  3. Assert class list includes one of the five valid rating words
- **Expected Result**: All 20 items have a `p.star-rating` element with a valid rating class

---

### TS-14: Rating Class Is Programmatically Parseable [FR-06]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: First `article.product_pod p.star-rating`
- **Steps**:
  1. Navigate to homepage
  2. Read the full class attribute of the first `p.star-rating`
  3. Split by space; assert one token is in `["One","Two","Three","Four","Five"]`
- **Expected Result**: Rating is determinable programmatically via class; not only visual

---

### TS-15: "Next" Pagination Link Visible on Page 1 [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Homepage root `/`
- **Steps**:
  1. Navigate to homepage
  2. Assert `li.next > a` is present and visible
  3. Assert `li.next > a` has a non-empty `href`
- **Expected Result**: "next" link is visible with a valid href

---

### TS-16: No "Previous" Link on Page 1 [FR-07]
- **Type**: Negative
- **Priority**: High
- **Preconditions**: Homepage loaded (page 1)
- **Test Data**: None
- **Steps**:
  1. Navigate to homepage
  2. Assert `li.previous` does NOT exist in the DOM
- **Expected Result**: No "previous" element is rendered on page 1

---

### TS-17: Clicking "Next" Navigates to Page 2 with New Books [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; `li.next > a` visible
- **Test Data**: None
- **Steps**:
  1. Navigate to homepage; collect all 20 `h3 > a` title texts
  2. Click `li.next > a`; wait for navigation
  3. Assert URL contains `page-2`
  4. Count `article.product_pod` elements
  5. Collect page 2 title texts; assert no overlap with page 1 titles
- **Expected Result**: URL contains `page-2`; between 1 and 20 book items on page 2; titles differ from page 1

---

### TS-18: "Next" Link Absent on Last Page (page 50) [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access to page 50
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-50.html`
- **Steps**:
  1. Navigate to `http://books.toscrape.com/catalogue/page-50.html`
  2. Assert `li.next` is NOT present in the DOM
  3. Assert `li.previous > a` IS present
- **Expected Result**: No "next" link on the final page; "previous" link is present

---

### TS-19: Page Beyond Last Does Not Show Empty Catalogue [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-51.html`
- **Steps**:
  1. Navigate to `http://books.toscrape.com/catalogue/page-51.html`
  2. Assert page does not silently render a completely empty catalogue with no feedback
- **Expected Result**: Page either redirects gracefully, shows a 404 message, or shows a "no results" indicator — not an empty product grid with no explanation

---

### TS-20: Clicking a Book Title Navigates to Its Detail Page [FR-08]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; first book item visible
- **Test Data**: First `article.product_pod h3 > a`
- **Steps**:
  1. Navigate to homepage
  2. Note title attribute of first `h3 > a`
  3. Click the anchor; wait for navigation
  4. Assert URL contains `/catalogue/`
  5. Assert page responds with HTTP 200
- **Expected Result**: Browser navigates to a `/catalogue/` URL; page loads successfully

---

### TS-21: Detail Page Link Does Not Return 404 [FR-08]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: `href` attribute of the first `h3 > a`
- **Steps**:
  1. Navigate to homepage
  2. Read `href` from first `h3 > a`
  3. Navigate directly to that URL
  4. Assert no "404" or "not found" heading
- **Expected Result**: Detail page loads without a 404 or error heading

---

### TS-22: Page Title Contains "Books" [FR-09]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: `document.title`
- **Steps**:
  1. Navigate to homepage
  2. Read `document.title`
  3. Assert it contains the word "Books" (case-insensitive)
- **Expected Result**: `document.title` is non-empty and contains "Books"

---

### TS-23: Site Header Is Visible on Load [FR-09]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: `header` or `.site-logo` selector
- **Steps**:
  1. Navigate to homepage
  2. Assert header element is visible in the viewport
- **Expected Result**: Site header/logo is rendered and visible; not hidden

---

### TS-24: Page Title Is Absent or Non-Descriptive on a 404 Page [FR-09]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: N/A
- **Test Data**: URL = `http://books.toscrape.com/nonexistent-page`
- **Steps**:
  1. Navigate to the nonexistent URL
  2. Assert the main book catalogue grid is not shown
- **Expected Result**: No book listing rendered; the page title or content differs from the homepage title

---

## Test Data Summary

| Data Set | Values | Purpose |
|---|---|---|
| Homepage URL | `http://books.toscrape.com` | Baseline positive load |
| Page 2 URL | `http://books.toscrape.com/catalogue/page-2.html` | Pagination navigation |
| Last page URL | `http://books.toscrape.com/catalogue/page-50.html` | Boundary — no "next" link |
| Beyond-last-page URL | `http://books.toscrape.com/catalogue/page-51.html` | Boundary — graceful beyond-end behaviour |
| Invalid path | `http://books.toscrape.com/nonexistent-page` | Negative — 404 scenario |
| Expected books per page | `20` | Exact-count boundary assertion |
| Total books in catalogue | `1000` (50 pages) | Context for pagination assertions |
| Price regex | `^£\d+\.\d{2}$` | FR-04 format validation |
| Minimum numeric price | `> £0.00` | FR-04 boundary: no zero-price books |
| Valid rating classes | `One, Two, Three, Four, Five` | FR-06 class validation |
| Availability values | `In stock`, `Out of stock` | FR-05 content validation |
| Viewport | `1280 × 720` (desktop) | All tests run at this minimum width |
| Credentials | None | Anonymous visitor; no login required |

---

## Dependencies / Environment

- **Network**: Live HTTP access to `http://books.toscrape.com` required from the test runner; no HTTPS; no authentication
- **Browser**: Chromium (Playwright default); desktop viewport 1280 × 720
- **JavaScript**: Site is static HTML/CSS; no JS-only content rendering; Playwright may use JS for assertions
- **No test accounts**: Zero credentials required; all pages publicly accessible
- **Known fixture state**: 1000 books, 50 pages, 20 per page — stable for this demo site; values may be used as hard assertions
- **No prior state**: Each test navigates fresh; no session state or cookies need to be cleared
- **Scope boundary**: Homepage `/`, pagination pages 2 and 50, and book detail pages are in scope; category filters, search, basket, and account pages are out of scope
