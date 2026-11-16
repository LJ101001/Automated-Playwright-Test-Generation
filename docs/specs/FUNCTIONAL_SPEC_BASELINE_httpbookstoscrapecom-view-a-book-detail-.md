# Functional Specification: httpbookstoscrapecom-view-a-book-detail-

## Source
Derived directly from requirement (no upstream USER_STORY file): "http://books.toscrape.com — view a book detail page and verify title price and availability"

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Static HTML book catalogue demo site; no authentication, no real checkout

---

## Functional Requirements

### FR-01: Book Detail Page Is Reachable From the Catalogue
**Description**: Clicking a book's title link on the homepage/catalogue must navigate the user to that exact book's detail page.
**Input**: Click on a `.product_pod h3 > a` link on the homepage or any catalogue listing page
**Expected Output / State Change**: Browser navigates to a `/catalogue/` detail page URL matching pattern `/catalogue/<book-slug>_<id>/index.html`; response status is 200.
**Validation Rules**:
- Resulting URL contains `/catalogue/` and differs from the pre-click catalogue URL
- Response status is 200
- Detail page loads within the same session without requiring re-authentication (none exists on this site)

---

### FR-02: Detail Page Displays the Correct Book Title
**Description**: The detail page must display the full title of the specific book that was clicked, not a different or truncated title.
**Input**: Rendered book detail page, reached via click-through or direct navigation
**Expected Output / State Change**: The `<h1>` element within `.product_main` contains the book's full title text.
**Validation Rules**:
- Title text is non-empty and not whitespace-only
- Title text matches (or is a non-truncated superset of) the source catalogue listing's `title` attribute value
- Special characters (apostrophes, ampersands, colons) render as literal characters, not HTML entities

---

### FR-03: Detail Page Displays a Correctly Formatted Price
**Description**: The detail page must display the book's price in GBP, formatted consistently with the catalogue listing price for the same book.
**Input**: Rendered book detail page
**Expected Output / State Change**: A price element (`.product_main p.price_color`) displays a value prefixed with "£".
**Validation Rules**:
- Price text matches regex `^£\d+\.\d{2}$`
- Numeric value (currency symbol stripped) is a positive, finite float
- Numeric value equals the price shown for the same book on its catalogue listing (exact match)

---

### FR-04: Detail Page Displays Availability Status

**Description**: The detail page must display a stock availability label indicating whether the book is in stock or out of stock.
**Input**: Rendered book detail page
**Expected Output / State Change**: An availability element (`.product_main p.instock.availability`) contains non-empty text indicating stock status.
**Validation Rules**:
- Text contains "In stock" or "Out of stock" (case-insensitive)
- If "In stock", text includes a parenthesised numeric copy count matching `\(\d+ available\)`
- Text is never empty or whitespace-only

---

### FR-05: Detail Page Is Directly Accessible via Stable URL
**Description**: Loading a book's detail page URL directly, without navigating through the catalogue first, must render title, price, and availability identically to click-through access.
**Input**: Direct HTTP navigation to a known book detail-page URL
**Expected Output / State Change**: Page returns HTTP 200 and renders title, price, and availability fields as defined in FR-02, FR-03, FR-04.
**Validation Rules**:
- URL matches `/catalogue/<book-slug>_<id>/index.html`
- Re-requesting the identical URL returns identical title, price, and availability values (idempotent)
- A URL referencing a nonexistent slug/id does not return a fabricated HTTP 200 product view

---

### FR-06: Detail Page Content Matches the Clicked Catalogue Entry
**Description**: When multiple books are listed on a catalogue page, clicking one specific book must never open a different book's detail page.
**Input**: Click on the title link of a specific `.product_pod` item among several listed on the same catalogue page
**Expected Output / State Change**: The resulting detail page's title, and price correspond only to the book that was clicked.
**Validation Rules**:
- Detail page `<h1>` text matches the clicked listing's title, not any sibling listing's title
- Detail page price matches the clicked listing's price, not any sibling listing's price
- Clicking a second, different listing from the same catalogue page yields a detail page with different title/price than the first

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---|---|---|
| `.product_pod h3 > a` | Anchor | Catalogue book title link; `title` attribute holds full title; navigates to detail page |
| `.product_pod p.price_color` | Paragraph | Catalogue listing price, used for cross-page comparison |
| `.product_main h1` | Heading | Detail page book title |
| `.product_main p.price_color` | Paragraph | Detail page price, matching `^£\d+\.\d{2}$` |
| `.product_main p.instock.availability` | Paragraph | Detail page stock status and optional copy count |
| `.breadcrumb` | Navigation | Breadcrumb trail confirming detail-page context |
| Detail page URL | Page/route | Expected pattern `/catalogue/<book-slug>_<id>/index.html`; exact path confirmed against the live site during implementation |

---

## Test Scenarios

### TS-01: Clicking a Catalogue Title Opens the Correct Detail Page [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded at `http://books.toscrape.com`
- **Test Data**: First book listed in `.product_pod` on the homepage
- **Steps**:
  1. Navigate to the homepage
  2. Click the title link of the first `.product_pod` item
  3. Assert resulting URL contains `/catalogue/` and differs from the homepage URL
  4. Assert response status is 200
- **Expected Result**: Browser lands on the corresponding detail page with HTTP 200

---

### TS-02: Navigation Does Not Silently Stay on the Same Page — Negative [FR-01]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: None
- **Steps**:
  1. Record the homepage URL
  2. Click a book title link
  3. Compare resulting URL to the recorded homepage URL
- **Expected Result**: Test fails if the URL is unchanged after the click, confirming navigation actually occurred

---

### TS-03: Detail Page Reachable via Cover Image — Boundary [FR-01]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Homepage loaded
- **Test Data**: First book's cover image link
- **Steps**:
  1. Navigate to the homepage
  2. Click the cover image (`.product_pod .image_container img`) of the first listing instead of its title
  3. Assert the same detail page is reached as clicking the title would produce
- **Expected Result**: Both the title link and the cover image link for the same book resolve to the same detail page URL

---

### TS-04: Detail Page Displays the Full Book Title [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Detail page loaded via click-through from the homepage
- **Test Data**: First book on the homepage
- **Steps**:
  1. Navigate to homepage, capture the `title` attribute of the first `.product_pod h3 > a`
  2. Click that link
  3. Read `.product_main h1` text
- **Expected Result**: `.product_main h1` is visible, non-empty, and matches (or is a non-truncated superset of) the captured title attribute

---

### TS-05: Long/Special-Character Title Renders Without Truncation — Boundary [FR-02]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: A book with a long title containing an apostrophe or ampersand exists in the catalogue (e.g. "It's Only the Himalayas")
- **Test Data**: Known full title string containing special characters
- **Steps**:
  1. Navigate directly to that book's detail page URL
  2. Read the full text content of `.product_main h1`
  3. Compare against the known full title string
- **Expected Result**: `<h1>` text exactly matches the known full title, with no ellipsis and no dropped or mangled characters

---

### TS-06: Missing or Empty Title Is Detected as a Failure — Negative [FR-02]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: N/A (assertion-based check)
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `.product_main h1` text is not empty and not whitespace-only
- **Expected Result**: Test fails loudly if the title text is absent, validating that the assertion itself catches a missing title

---

### TS-07: Detail Page Price Is Correctly Formatted [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Detail page loaded for any book
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read text of `.product_main p.price_color`
- **Expected Result**: Text matches regex `^£\d+\.\d{2}$`

---

### TS-08: Detail Page Price Matches Catalogue Listing Price [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage catalogue loaded
- **Test Data**: First book on the homepage
- **Steps**:
  1. Read price text from `.product_pod p.price_color` for the first listing on the homepage
  2. Click through to that book's detail page
  3. Read price text from `.product_main p.price_color`
- **Expected Result**: Numeric values of both prices are equal

---

### TS-09: Malformed/Non-Numeric Price Is Detected as a Failure — Negative [FR-03]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: Price string with currency symbol stripped
- **Steps**:
  1. Navigate to a book detail page
  2. Strip "£" from the price text and attempt `parseFloat`
  3. Assert the result is a finite number greater than 0
- **Expected Result**: Test fails if the price string cannot be parsed as a positive float, guarding against malformed currency strings

---

### TS-10: In-Stock Availability Includes Copy Count [FR-04]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Detail page loaded for a book known to be in stock
- **Test Data**: Any in-stock catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read text of `.product_main p.instock.availability`
- **Expected Result**: Text contains "In stock" and a parenthesised numeric count matching `\(\d+ available\)`

---

### TS-11: Availability Count of Zero Is Distinguished From a Generic Label — Boundary [FR-04]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: A book detail page with 0 copies available (if present in the dataset) or a simulated DOM state
- **Test Data**: Availability text "In stock (0 available)"
- **Steps**:
  1. Navigate to a book detail page
  2. Parse the numeric count from the availability text
- **Expected Result**: Count is explicitly captured as the integer 0, distinct from an absent-count "Out of stock" label

---

### TS-12: Missing Availability Text Is Detected as a Failure — Negative [FR-04]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `.product_main p.instock.availability` text is not empty/whitespace-only
- **Expected Result**: Test fails if the availability element is empty or missing

---

### TS-13: Direct Navigation to a Known Detail URL Renders All Core Fields [FR-05]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: A known, valid book detail-page URL
- **Test Data**: URL matching `/catalogue/<book-slug>_<id>/index.html`
- **Steps**:
  1. Navigate directly to the URL without visiting the catalogue first
  2. Assert response status is 200
  3. Assert title, price, and availability elements are all present and non-empty
- **Expected Result**: Page renders identically to click-through access, with all three fields populated

---

### TS-14: Repeated Requests to the Same URL Are Idempotent — Boundary [FR-05]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: A known, valid book detail-page URL
- **Test Data**: Same URL requested twice
- **Steps**:
  1. Navigate to the detail page URL and record title, price, and availability text
  2. Reload the same URL
  3. Compare the newly read title, price, and availability text against the first recording
- **Expected Result**: All three field values are identical across both requests

---

### TS-15: Nonexistent Book URL Does Not Return a Fabricated Product View — Negative [FR-05]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Network access available
- **Test Data**: URL = `http://books.toscrape.com/catalogue/nonexistent-book_99999/index.html`
- **Steps**:
  1. Navigate directly to the invalid detail-page URL
  2. Assert the page does not render a valid title/price/availability set as if it were a real product
- **Expected Result**: Page shows a 404/error state, not a false-positive product view

---

### TS-16: Detail Page Matches the Specific Clicked Listing [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded with at least two listings
- **Test Data**: Titles and prices of the first and second `.product_pod` items
- **Steps**:
  1. Navigate to the homepage
  2. Record the title and price of the first and second listings
  3. Click the first listing's title link
  4. Assert the resulting detail page's title and price match the first listing, not the second
- **Expected Result**: Detail page content corresponds only to the clicked listing

---

### TS-17: Clicking a Different Listing Yields Different Detail Content — Boundary [FR-06]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Homepage loaded with at least two listings
- **Test Data**: First and second `.product_pod` items
- **Steps**:
  1. Navigate to the homepage and click the first listing; record its detail page title and price
  2. Navigate back to the homepage and click the second listing; record its detail page title and price
- **Expected Result**: The two recorded (title, price) pairs are different from each other

---

### TS-18: Detail Page Does Not Reuse a Stale Title From a Prior Navigation — Negative [FR-06]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Homepage loaded with at least two listings
- **Test Data**: First and second `.product_pod` items
- **Steps**:
  1. Click the first listing and record its detail page title
  2. Navigate back to the homepage
  3. Click the second listing
  4. Assert the newly loaded detail page title differs from the first recorded title
- **Expected Result**: Test fails if the second navigation incorrectly displays the first book's title, catching stale-state bugs

---

## Test Data Summary

| Data Set | Values | Purpose |
|---|---|---|
| Target book (default) | First book listed on the homepage | Primary subject for detail-page field verification (title, price, availability) |
| Second book (comparator) | Second book listed on the homepage | Confirms detail navigation does not leak content between listings (TS-16–TS-18) |
| Long/special-character title book | A catalogue book with an apostrophe, ampersand, or colon (e.g. "It's Only the Himalayas") | Verifies FR-02 boundary condition for title rendering |
| Price regex | `^£\d+\.\d{2}$` | FR-03 format validation |
| Availability values | `In stock (N available)`, `Out of stock` | FR-04 content validation |
| Zero-stock availability | "In stock (0 available)" | Boundary case for FR-04 (TS-11) |
| Invalid detail URL | `/catalogue/nonexistent-book_99999/index.html` | Boundary/negative — nonexistent book handling (TS-15) |
| Viewport | 1280 × 720 (desktop) | Default test viewport |
| Credentials | None | Anonymous browsing; no login required |

---

## Dependencies / Environment

- **Network**: Live HTTP access to `http://books.toscrape.com`; no HTTPS; no authentication
- **Browser**: Chromium (Playwright default); desktop viewport 1280 × 720
- **JavaScript**: Site is static HTML/CSS; assertions may use JS but rendering does not depend on it
- **No test accounts**: All pages are publicly accessible
- **Selectors**: Books to Scrape has no `data-test` attributes; selectors above are the site's actual CSS classes/structure and should be confirmed against the live DOM before implementation
- **Scope boundary**: Navigation to a book detail page and verification of title, price, and availability are in scope; product description, star rating, the full product information table, and cover image integrity are out of scope for this baseline spec
