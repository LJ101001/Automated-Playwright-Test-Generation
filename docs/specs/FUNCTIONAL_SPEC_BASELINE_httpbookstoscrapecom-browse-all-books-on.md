# Functional Specification: httpbookstoscrapecom-browse-all-books-on

## Source
Derived directly from requirement (no upstream USER_STORY file): "http://books.toscrape.com — browse all books on the homepage"

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Static HTML book catalogue demo site; no authentication, no real checkout

---

## Functional Requirements

### FR-01: Homepage Loads and Renders the Book Catalogue
**Description**: A visitor navigating to the root URL must receive a successful page load that displays the book catalogue grid.
**Input**: HTTP GET to `http://books.toscrape.com`
**Expected Output / State Change**: HTTP 200 response; DOM contains at least one `article.product_pod` element; no uncaught JavaScript errors.
**Validation Rules**:
- Response status must be 200
- At least one `article.product_pod` element must exist in the DOM
- No uncaught JavaScript console errors during load

---

### FR-02: Catalogue Grid Shows a Fixed Page Size
**Description**: The homepage must display a fixed, countable number of book items per page (20).
**Input**: Rendered homepage at `/`
**Expected Output / State Change**: Exactly 20 `article.product_pod` elements are visible in the grid.
**Validation Rules**:
- Count of visible `article.product_pod` elements equals exactly 20
- No item has `display:none` or is otherwise hidden
- No duplicate book (same title + href) appears twice on the page

---

### FR-03: Each Book Item Exposes Identifying Information
**Description**: Every book card must show a cover thumbnail and a title that is also a navigable link, so a user can identify and select a book.
**Input**: Rendered homepage with 20 items
**Expected Output / State Change**: Each `article.product_pod` contains an `<img>` with non-empty `src` and an `<h3><a>` with non-empty text/title and a valid `href`.
**Validation Rules**:
- `img` `src` attribute is non-empty
- `h3 > a` text or `title` attribute is non-empty
- `h3 > a` `href` resolves to a `/catalogue/` detail page
- No item is missing either element

---

### FR-04: Each Book Item Displays Price Information
**Description**: Every book card must display its price in GBP, formatted to two decimal places, so the user can browse by cost.
**Input**: Rendered homepage listing
**Expected Output / State Change**: Each `article.product_pod` contains a `.price_color` element with text matching `£\d+\.\d{2}`.
**Validation Rules**:
- Price text matches regex `^£\d+\.\d{2}$`
- Price element is visible
- Parsed numeric value is greater than 0.00
- No item is missing a price element

---

### FR-05: Each Book Item Displays Stock Availability
**Description**: Every book card must show whether the item is in stock.
**Input**: Rendered homepage listing
**Expected Output / State Change**: Each `article.product_pod` contains a non-empty `.availability` element.
**Validation Rules**:
- `.availability` element present on every item
- Text non-empty and visible
- Accepted values: "In stock" or "Out of stock" (case-insensitive)

---

### FR-06: Each Book Item Displays a Star Rating
**Description**: Every book card must show a machine-readable star rating (1–5) so users can browse by perceived quality.
**Input**: Rendered homepage listing
**Expected Output / State Change**: Each `article.product_pod` contains a `p.star-rating` element whose class list includes exactly one of `One`, `Two`, `Three`, `Four`, `Five`.
**Validation Rules**:
- `p.star-rating` present on every item
- Class list contains exactly one of the five valid rating words
- Rating is determinable via DOM attribute, not only via rendered stars

---

### FR-07: User Can Page Through the Full Catalogue
**Description**: Since the catalogue exceeds one page of results, pagination controls must let the user move forward (and backward) through all books.
**Input**: Homepage load; click on "next" link; repeat across pages
**Expected Output / State Change**: `li.next > a` visible on page 1 and absent on the final page; clicking it advances the URL (e.g. to `page-2.html`) and loads a new set of up to 20 items; `li.previous` absent on page 1, present thereafter.
**Validation Rules**:
- `li.next > a` present and visible whenever a further page exists
- `li.previous` absent on page 1 only
- Clicking "next" updates the URL and renders 1–20 new `article.product_pod` items with no overlap with the previous page
- "next" link absent on the last page of the catalogue

---

### FR-08: Selecting a Book Navigates to Its Detail Page
**Description**: Clicking a book's title or cover image must take the user to that book's individual detail page.
**Input**: Click on `article.product_pod h3 > a` or its accompanying image link
**Expected Output / State Change**: Browser navigates to a URL containing `/catalogue/`; the detail page returns HTTP 200 and is not the homepage.
**Validation Rules**:
- Resulting URL contains `/catalogue/`
- Detail page response status is 200
- Detail page content differs from the homepage (not a redirect back to `/`)

---

### FR-09: Page Identifies the Site to the User
**Description**: The browsing experience must clearly identify the application via page title and visible header/branding.
**Input**: Rendered homepage
**Expected Output / State Change**: `document.title` is non-empty and descriptive; a header/logo element is visible.
**Validation Rules**:
- `document.title` contains the word "Books" (case-insensitive)
- Header/logo element is visible and non-empty

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---|---|---|
| `article.product_pod` | Article (book card) | One per book; exactly 20 present on a full page |
| `article.product_pod h3 > a` | Anchor | Book title link; `title` attribute holds full title; navigates to `/catalogue/...` detail page |
| `article.product_pod img` | Image | Cover thumbnail; non-empty `src` |
| `article.product_pod .price_color` | Paragraph | Price text matching `^£\d+\.\d{2}$` |
| `article.product_pod .availability` | Paragraph | "In stock" / "Out of stock" text |
| `article.product_pod p.star-rating` | Paragraph | Class includes one rating word `One`–`Five` |
| `li.next > a` | Anchor (pagination) | Advances to the next catalogue page; absent on last page |
| `li.previous > a` | Anchor (pagination) | Returns to prior page; absent on page 1 |
| `ul.pager` | List | Pagination container |
| `header` / `.site-logo` | Header | Site branding, visible on every page |
| `title` (document) | HTML `<title>` | Non-empty, contains "Books" |

---

## Test Scenarios

### TS-01: Homepage Loads Successfully [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Network access to http://books.toscrape.com
- **Test Data**: URL = `http://books.toscrape.com`
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Wait for network idle
  3. Assert at least one `article.product_pod` is present
  4. Assert no console errors
- **Expected Result**: Page returns HTTP 200, renders at least one book item, no console errors

---

### TS-02: Unreachable Path Shows No Catalogue [FR-01]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Network access available
- **Test Data**: URL = `http://books.toscrape.com/nonexistent-page`
- **Steps**:
  1. Navigate to the nonexistent path
  2. Count `article.product_pod` elements
- **Expected Result**: Zero book items rendered; an error/404 indicator is shown

---

### TS-03: Exactly 20 Books on the First Page [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Homepage root `/`
- **Steps**:
  1. Navigate to homepage
  2. Count `article.product_pod` elements
- **Expected Result**: Count equals exactly 20

---

### TS-04: Book Count Is Not 19 or 21 — Boundary [FR-02]
- **Type**: Boundary
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Expected count = 20
- **Steps**:
  1. Navigate to homepage
  2. Count `article.product_pod` elements
  3. Assert count is neither 19 nor 21
- **Expected Result**: Count is exactly 20, not off-by-one in either direction

---

### TS-05: Every Book Has a Cover Image and Title Link [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; 20 items present
- **Test Data**: All `article.product_pod` items
- **Steps**:
  1. Navigate to homepage
  2. For each item, assert `img[src]` is non-empty and `h3 > a` text/title is non-empty
- **Expected Result**: All 20 items have a non-empty image source and title link

---

### TS-06: Book With Missing Title Is Detected [FR-03]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: All `h3 > a` elements
- **Steps**:
  1. Navigate to homepage
  2. Assert no `h3 > a` has empty or whitespace-only text/title
- **Expected Result**: Zero items fail the non-empty-title check

---

### TS-07: Every Book Shows a Valid GBP Price [FR-04]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Regex `^£\d+\.\d{2}$`
- **Steps**:
  1. Navigate to homepage
  2. For each `.price_color`, assert text matches the regex
- **Expected Result**: All 20 prices match the GBP format

---

### TS-08: Price Numeric Value Is Greater Than Zero — Boundary [FR-04]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Homepage loaded
- **Test Data**: All `.price_color` text values
- **Steps**:
  1. Navigate to homepage
  2. Strip `£` and parse remaining text as a float for each price
  3. Assert each value > 0.00
- **Expected Result**: No book has a zero or negative price

---

### TS-09: Every Book Shows an Availability Label [FR-05]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: All `.availability` elements
- **Steps**:
  1. Navigate to homepage
  2. Assert each `article.product_pod` has a non-empty `.availability` child
- **Expected Result**: All 20 items show a non-empty availability label

---

### TS-10: No Book Missing Its Availability Element [FR-05]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: All `article.product_pod` containers
- **Steps**:
  1. Navigate to homepage
  2. Assert `.availability` child exists for every item
- **Expected Result**: Zero items are missing the availability element

---

### TS-11: Every Book Has a Valid Star Rating Class [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Valid classes = `["One","Two","Three","Four","Five"]`
- **Steps**:
  1. Navigate to homepage
  2. For each `p.star-rating`, assert its class list contains one valid rating word
- **Expected Result**: All 20 items have exactly one valid rating class

---

### TS-12: Star Rating Is Programmatically Parseable — Boundary [FR-06]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: First `p.star-rating` element
- **Steps**:
  1. Navigate to homepage
  2. Read the `class` attribute of the first `p.star-rating`
  3. Split by whitespace and assert one token is a valid rating word
- **Expected Result**: Rating is determinable from the DOM attribute alone

---

### TS-13: "Next" Link Visible on Page 1 [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: None
- **Steps**:
  1. Navigate to homepage
  2. Assert `li.next > a` is visible with a non-empty `href`
- **Expected Result**: "next" link is present and usable

---

### TS-14: No "Previous" Link on Page 1 [FR-07]
- **Type**: Negative
- **Priority**: High
- **Preconditions**: Homepage loaded (page 1)
- **Test Data**: None
- **Steps**:
  1. Navigate to homepage
  2. Assert `li.previous` is absent from the DOM
- **Expected Result**: No "previous" element on page 1

---

### TS-15: Clicking "Next" Advances to a New Set of Books [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; "next" link visible
- **Test Data**: None
- **Steps**:
  1. Navigate to homepage; collect all 20 title texts
  2. Click `li.next > a`; wait for navigation
  3. Assert URL contains `page-2`
  4. Collect new page's titles; assert no overlap with page 1
- **Expected Result**: URL updates to page 2; between 1 and 20 items shown; titles differ from page 1

---

### TS-16: "Next" Link Absent on the Last Page — Boundary [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access to the catalogue's final page
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-50.html`
- **Steps**:
  1. Navigate directly to page 50
  2. Assert `li.next` is absent
  3. Assert `li.previous > a` is present
- **Expected Result**: No "next" link on the last page; "previous" link present

---

### TS-17: Requesting a Page Beyond the Last Does Not Show an Unexplained Empty Grid — Boundary [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-51.html`
- **Steps**:
  1. Navigate directly to page 51
  2. Assert the response is not a silent empty product grid with no feedback
- **Expected Result**: Page redirects, shows a 404, or shows an explicit "no results" indicator

---

### TS-18: Clicking a Book Title Opens Its Detail Page [FR-08]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: First `article.product_pod h3 > a`
- **Steps**:
  1. Navigate to homepage
  2. Click the first book's title link
  3. Assert URL contains `/catalogue/`
  4. Assert detail page returns HTTP 200
- **Expected Result**: Navigation succeeds to a valid detail page

---

### TS-19: Detail Page Link Does Not Resolve to a 404 [FR-08]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: `href` of the first `h3 > a`
- **Steps**:
  1. Navigate to homepage
  2. Read the `href` of the first title link
  3. Navigate directly to that URL
  4. Assert no "404" or "not found" heading appears
- **Expected Result**: Detail page loads without an error heading

---

### TS-20: Page Title Identifies the Site [FR-09]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: `document.title`
- **Steps**:
  1. Navigate to homepage
  2. Assert `document.title` contains "Books" (case-insensitive)
- **Expected Result**: Title is non-empty and contains "Books"

---

### TS-21: Site Header Is Visible [FR-09]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: `header` / `.site-logo` selector
- **Steps**:
  1. Navigate to homepage
  2. Assert the header/logo element is visible in the viewport
- **Expected Result**: Header/branding is visible and not hidden

---

### TS-22: Nonexistent Page Does Not Reuse the Homepage Title/Content — Boundary [FR-09]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Network access
- **Test Data**: URL = `http://books.toscrape.com/nonexistent-page`
- **Steps**:
  1. Navigate to the nonexistent path
  2. Assert the catalogue grid is not rendered with valid items
- **Expected Result**: Content differs from a normal homepage load; no valid book listing shown

---

## Test Data Summary

| Data Set | Values | Purpose |
|---|---|---|
| Homepage URL | `http://books.toscrape.com` | Baseline positive load |
| Page 2 URL | `http://books.toscrape.com/catalogue/page-2.html` | Pagination navigation target |
| Last page URL | `http://books.toscrape.com/catalogue/page-50.html` | Boundary — no "next" link |
| Beyond-last-page URL | `http://books.toscrape.com/catalogue/page-51.html` | Boundary — graceful end-of-catalogue behaviour |
| Invalid path | `http://books.toscrape.com/nonexistent-page` | Negative — unreachable/404 scenario |
| Expected books per page | `20` | Exact-count boundary assertion |
| Total catalogue size | `1000` books / `50` pages | Context for pagination boundaries |
| Price regex | `^£\d+\.\d{2}$` | FR-04 format validation |
| Minimum numeric price | `> £0.00` | FR-04 boundary check |
| Valid rating classes | `One, Two, Three, Four, Five` | FR-06 class validation |
| Availability values | `In stock`, `Out of stock` | FR-05 content validation |
| Viewport | `1280 × 720` (desktop) | Default test viewport |
| Credentials | None | Anonymous browsing; no login required |

---

## Dependencies / Environment

- **Network**: Live HTTP access to `http://books.toscrape.com`; no HTTPS; no authentication
- **Browser**: Chromium (Playwright default); desktop viewport 1280 × 720
- **JavaScript**: Site is static HTML/CSS; assertions may use JS but rendering does not depend on it
- **No test accounts**: All pages are publicly accessible
- **Known fixture state**: 1000 books across 50 pages, 20 per page — stable for this demo site; safe to assert as fixed values
- **No prior state**: Each test navigates fresh; no session/cookie cleanup required
- **Scope boundary**: Homepage `/`, pagination pages 2/50/51, and book detail pages are in scope; category sidebar filters, search, basket, and account pages are out of scope
