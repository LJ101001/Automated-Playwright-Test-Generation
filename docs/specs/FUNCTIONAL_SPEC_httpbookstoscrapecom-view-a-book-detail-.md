# Functional Specification: httpbookstoscrapecom-view-a-book-detail-

## Source
docs/specs/USER_STORY_httpbookstoscrapecom-view-a-book-detail-.md

## Application Under Test
Books to Scrape (http://books.toscrape.com) — static demo book catalogue website, no authentication, publicly accessible.

## Functional Requirements

### FR-01: Book title display
**Description**: The book detail page must display the book's full, untruncated title.
**Input**: Navigation to a book detail page URL (e.g. `http://books.toscrape.com/catalogue/<book-slug>_<id>/index.html`), either via click-through from the catalogue or direct navigation.
**Expected Output / State Change**: The `<h1>` element within the product main section contains the book's full title text, matching (or a non-truncated superset of) the title shown on the catalogue listing.
**Validation Rules**: Title text must be non-empty; length must not be visually truncated (no CSS ellipsis hiding characters); special characters (apostrophes, ampersands, colons) must render as literal characters, not HTML entities or mangled text.

### FR-02: Price display and consistency
**Description**: The book detail page must display the book's price in GBP, and this price must match the price shown for the same book on the catalogue/listing page.
**Input**: Navigation to a book detail page; corresponding catalogue listing page for the same book.
**Expected Output / State Change**: A price element (`p.price_color`) within the product main section displays a value prefixed with "£".
**Validation Rules**: Price string must match pattern `£\d+\.\d{2}`; the numeric value (with currency symbol stripped) must be parseable as a positive floating-point number; numeric value must equal the price shown on the catalogue page for the same book (exact match).

### FR-03: Availability status display
**Description**: The book detail page must display an availability label indicating in-stock or out-of-stock status, including a copy count when in stock.
**Input**: Navigation to a book detail page.
**Expected Output / State Change**: An availability element (`p.instock.availability`) within the product main section contains text indicating stock status (e.g. "In stock" or "Out of stock").
**Validation Rules**: If status is "In stock", the text must include a numeric copy count (e.g. "In stock (19 available)") and that number must be a non-negative integer; an availability count of exactly 0 must be distinguishable from a general out-of-stock label (i.e. "0 available" vs. no count present); text must not be empty or whitespace-only.

### FR-04: Product description display
**Description**: The book detail page must display a product description or synopsis text.
**Input**: Navigation to a book detail page.
**Expected Output / State Change**: A description paragraph (`#product_description` sibling `<p>`) is present and visible on the page.
**Validation Rules**: Description text must be present (non-null) even if short; a present-but-boilerplate/short string still counts as valid — only a fully missing/empty element fails this requirement.

### FR-05: Star rating display
**Description**: The book detail page must display a star rating between one and five stars.
**Input**: Navigation to a book detail page.
**Expected Output / State Change**: An element with class `star-rating` plus a rating word class (e.g. `star-rating Three`) is present within the product main section.
**Validation Rules**: The rating class must be one of: One, Two, Three, Four, Five; the element must be present exactly once per book detail page.

### FR-06: Product information table display
**Description**: The book detail page must display a product information table containing UPC, price (excl. tax), price (incl. tax), tax, availability, and number of reviews.
**Input**: Navigation to a book detail page.
**Expected Output / State Change**: A `table.table-striped` element is present with row headers (`th`) matching: "UPC", "Price (excl. tax)", "Price (incl. tax)", "Tax", "Availability", "Number of reviews", each with a corresponding `td` value.
**Validation Rules**: All six rows must be present; UPC must be a non-empty alphanumeric string; both price fields must match `£\d+\.\d{2}`; tax must match `£\d+\.\d{2}`; availability cell text must contain a numeric count; number of reviews must be a non-negative integer.

### FR-07: Navigation from catalogue to correct detail page
**Description**: Clicking a book's title or cover image from the homepage or catalogue listing must navigate to the detail page for that exact book.
**Input**: Click action on a book's title link or cover image link within a `.product_pod` element on the catalogue/homepage.
**Expected Output / State Change**: Browser navigates to a URL matching `/catalogue/<book-slug>_<id>/index.html`; the `<h1>` title on the resulting detail page equals the title text of the clicked catalogue entry.
**Validation Rules**: Post-navigation URL must differ from the pre-navigation catalogue URL; the detail page title must exactly match the source link's title/text (accounting for the catalogue's truncated `title` attribute vs. full `<h1>` text — the `<h1>` value must be used as the source of truth and must start with or equal the catalogue's non-truncated `title` attribute value).

### FR-08: Cover image display
**Description**: The book detail page must display a cover image for the book that loads without error.
**Input**: Navigation to a book detail page.
**Expected Output / State Change**: An `<img>` element inside `div.item.active` (product gallery) is present, visible, and has `naturalWidth > 0` (i.e. the image resource resolved successfully).
**Validation Rules**: `src` attribute must be non-empty; the image must not be a broken-link placeholder (`naturalWidth` and `naturalHeight` must both be greater than 0); no HTTP error status on the image request.

### FR-09: Detail page URL stability and direct access
**Description**: Each book must be reachable via a stable, predictable, book-specific URL, and loading that URL directly (without navigating through the catalogue first) must render all required fields.
**Input**: A direct HTTP navigation to a book's detail-page URL, issued without first visiting the catalogue in the current session.
**Expected Output / State Change**: The page returns HTTP 200 and renders title, price, availability, description, rating, product information table, and cover image identically to when the page is reached via click-through (FR-01–FR-08).
**Validation Rules**: URL must match `/catalogue/<book-slug>_<id>/index.html`; re-requesting the identical URL must return identical field values (title, price, UPC) confirming idempotency; a URL referencing a nonexistent slug/id must not return a fabricated HTTP 200 product view.

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---------------|-------------|-------------------|
| `.product_main h1` | text (heading) | Displays full book title |
| `.product_main p.price_color` | text | Displays price in `£XX.XX` format |
| `.product_main p.instock.availability` | text | Displays stock status and optional copy count |
| `#product_description ~ p` | text (paragraph) | Displays product description/synopsis |
| `.product_main .star-rating` | element (class-based rating) | Class suffix (One–Five) indicates star rating |
| `table.table-striped` | table | Contains UPC, Product Type, Price (excl. tax), Price (incl. tax), Tax, Availability, Number of reviews rows |
| `table.table-striped tr:nth-child(1) td` | text | UPC value |
| `table.table-striped tr:nth-child(3) td` | text | Price (excl. tax) value |
| `table.table-striped tr:nth-child(4) td` | text | Price (incl. tax) value |
| `table.table-striped tr:nth-child(5) td` | text | Tax value |
| `table.table-striped tr:nth-child(6) td` | text | Availability value (with count) |
| `table.table-striped tr:nth-child(7) td` | text | Number of reviews value |
| `.product_pod h3 a` | link | Catalogue-page book title link; navigates to detail page |
| `.product_pod .image_container img` | link/image | Catalogue-page cover thumbnail link; navigates to detail page |
| `.product_pod p.price_color` | text | Catalogue-page price, used for cross-page comparison |
| `div.item.active img` | image | Detail-page cover image |
| `.breadcrumb` | navigation | Breadcrumb trail confirming page context |

## Test Scenarios

### TS-01: Detail page displays full book title [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Home page loaded at http://books.toscrape.com
- **Test Data**: First book listed on the homepage catalogue
- **Steps**:
  1. Navigate to homepage
  2. Click the title link of the first book in `.product_pod`
  3. Locate `.product_main h1`
- **Expected Result**: `.product_main h1` is visible and contains non-empty text

### TS-02: Long/special-character title renders without truncation [FR-01]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: A book with a long title containing an apostrophe or ampersand exists in the catalogue (e.g. "It's Only the Himalayas")
- **Test Data**: Book title containing apostrophe/ampersand/colon
- **Steps**:
  1. Navigate directly to that book's detail page URL
  2. Read full text content of `.product_main h1`
  3. Compare against known full title string
- **Expected Result**: `<h1>` text exactly matches the known full title with no ellipsis character and no missing characters

### TS-03: Missing/empty title is detected as a failure [FR-01]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: N/A (assertion-based check)
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `.product_main h1` text is not empty and not whitespace-only
- **Expected Result**: Test fails loudly if title text is empty (validates the assertion itself catches an absent title)

### TS-04: Price displayed in GBP format on detail page [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Detail page loaded for any book
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read text of `.product_main p.price_color`
- **Expected Result**: Text matches regex `^£\d+\.\d{2}$`

### TS-05: Detail page price matches catalogue listing price [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage catalogue loaded
- **Test Data**: First book on homepage
- **Steps**:
  1. Read price text from `.product_pod p.price_color` on homepage for the first book
  2. Click through to that book's detail page
  3. Read price text from `.product_main p.price_color`
- **Expected Result**: Numeric values of both prices are equal

### TS-06: Malformed/non-numeric price is detected as a failure [FR-02]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: Price string with currency symbol stripped
- **Steps**:
  1. Navigate to a book detail page
  2. Strip "£" from price text and attempt `parseFloat`
  3. Assert result is a finite number greater than 0
- **Expected Result**: Test fails if price string cannot be parsed as a positive float (guards against malformed currency strings)

### TS-07: In-stock availability includes copy count [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Detail page loaded for a book known to be in stock
- **Test Data**: Any in-stock catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read text of `.product_main p.instock.availability`
- **Expected Result**: Text contains "In stock" and a parenthesised numeric count matching `\(\d+ available\)`

### TS-08: Availability count of zero is distinguished from generic out-of-stock [FR-03]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: A book detail page with 0 copies available (if present in dataset) or a simulated/mocked DOM state
- **Test Data**: Availability text "In stock (0 available)"
- **Steps**:
  1. Navigate to a book detail page
  2. Parse the numeric count from the availability text
- **Expected Result**: Count is explicitly captured as the integer 0, distinct from an absent-count "Out of stock" label — assertion differentiates `count === 0` from `count === null`

### TS-09: Missing availability text is detected as a failure [FR-03]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `.product_main p.instock.availability` text is not empty/whitespace-only
- **Expected Result**: Test fails if the availability element is empty or missing

### TS-10: Product description text is visible [FR-04]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Detail page loaded for a book with a standard description
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Locate `#product_description ~ p`
- **Expected Result**: Element is visible and text length > 0

### TS-11: Short/boilerplate description is still detected as present [FR-04]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: A book with an unusually short description (if present in dataset), or minimal placeholder text
- **Test Data**: Short description string (e.g. under 20 characters)
- **Steps**:
  1. Navigate to that book's detail page
  2. Assert description paragraph exists and text length >= 1
- **Expected Result**: Test does not require a minimum text length beyond non-empty; short text still passes presence check

### TS-12: Missing description section is detected as a failure [FR-04]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Detail page loaded
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `#product_description` heading and following `<p>` both exist in the DOM
- **Expected Result**: Test fails if the description section is entirely absent from the page

### TS-13: Star rating is displayed with a valid class [FR-05]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read the `class` attribute of `.product_main .star-rating`
- **Expected Result**: Class list includes exactly one of: One, Two, Three, Four, Five

### TS-14: Star rating element present exactly once [FR-05]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Detail page loaded
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Count elements matching `.product_main .star-rating`
- **Expected Result**: Count equals 1 (not duplicated, not absent)

### TS-15: Invalid/missing rating class is detected as a failure [FR-05]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Detail page loaded
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a book detail page
  2. Assert the `star-rating` element's class attribute matches `/star-rating (One|Two|Three|Four|Five)/`
- **Expected Result**: Test fails if class does not match one of the five valid rating words

### TS-16: Product information table contains all required fields [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Detail page loaded
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read all `th` texts within `table.table-striped`
- **Expected Result**: Header list equals ["UPC", "Product Type", "Price (excl. tax)", "Price (incl. tax)", "Tax", "Availability", "Number of reviews"]

### TS-17: Table price fields are valid GBP values [FR-06]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: Table rows 3, 4, 5 (Price excl. tax, Price incl. tax, Tax)
- **Steps**:
  1. Navigate to a book detail page
  2. Read `td` text for Price (excl. tax), Price (incl. tax), and Tax rows
- **Expected Result**: All three values match regex `^£\d+\.\d{2}$`

### TS-18: Missing or incomplete table is detected as a failure [FR-06]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `table.table-striped` exists and contains exactly 7 rows
- **Expected Result**: Test fails if the table is missing or has fewer than 7 rows

### TS-19: Clicking a catalogue title navigates to the matching detail page [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: First book on homepage
- **Steps**:
  1. Navigate to homepage
  2. Capture the `title` attribute text of the first `.product_pod h3 a`
  3. Click that link
  4. Read `.product_main h1` text on the resulting page
- **Expected Result**: Resulting URL matches `/catalogue/.+_\d+\/index\.html/`; `<h1>` text corresponds to the clicked book's title (h1 starts with or equals the catalogue `title` attribute value)

### TS-20: Clicking a cover image navigates to the matching detail page [FR-07]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: First book on homepage
- **Steps**:
  1. Navigate to homepage
  2. Capture the first `.product_pod` book's title text
  3. Click the cover image link (`.product_pod .image_container img`) for that same product pod
  4. Read `.product_main h1` text on the resulting page
- **Expected Result**: Detail page `<h1>` corresponds to the same book as the clicked cover image

### TS-21: Navigation does not silently stay on the same page [FR-07]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: N/A
- **Steps**:
  1. Record homepage URL
  2. Click a book title link
  3. Compare resulting URL to recorded homepage URL
- **Expected Result**: Test fails if URL is unchanged after the click (navigation did not occur)

### TS-22: Cover image is visible and resolves without error [FR-08]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Detail page loaded
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Locate `div.item.active img`
  3. Evaluate `naturalWidth` and `naturalHeight` of the image element
- **Expected Result**: Image is visible; `naturalWidth > 0` and `naturalHeight > 0`

### TS-23: Cover image has a non-empty src attribute [FR-08]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Detail page loaded
- **Test Data**: Any catalogue book
- **Steps**:
  1. Navigate to a book detail page
  2. Read `src` attribute of `div.item.active img`
- **Expected Result**: `src` attribute is non-empty and does not equal a placeholder/blank value

### TS-24: Broken image resource is detected as a failure [FR-08]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Detail page loaded
- **Test Data**: N/A
- **Steps**:
  1. Navigate to a book detail page
  2. Assert `naturalWidth` of `div.item.active img` is greater than 0
- **Expected Result**: Test fails if the image resource failed to load (`naturalWidth === 0`), simulating detection of a broken image link

## Test Data Summary

| Data Set | Values | Purpose |
|----------|--------|---------|
| Target book (default) | First book listed on http://books.toscrape.com homepage | Primary subject for detail-page field verification (title, price, availability, description, rating, table, image) |
| Long/special-character title book | A catalogue book with an apostrophe, ampersand, or colon in its title (e.g. "It's Only the Himalayas") | Verifies FR-01 boundary condition for title rendering |
| Price format regex | `^£\d+\.\d{2}$` | Validates GBP price formatting across FR-02 and FR-06 |
| Valid star rating classes | One, Two, Three, Four, Five | Validates FR-05 rating class values |
| Expected table headers | UPC, Product Type, Price (excl. tax), Price (incl. tax), Tax, Availability, Number of reviews | Validates FR-06 table completeness |
| Detail page URL pattern | `/catalogue/<book-slug>_<id>/index.html` | Validates FR-07 navigation and stable URL structure |

## Dependencies / Environment
- Target site: http://books.toscrape.com (static demo catalogue, publicly accessible, no authentication)
- Desktop viewport: 1280×720 or wider
- No test credentials or account setup required
- Site availability assumed stable during test execution; no mocking of network layer required
- Tests must tolerate the demo dataset's static nature — target book selection defaults to the first book on the homepage unless a scenario specifically requires a book with distinguishing characteristics (e.g. long title, zero-stock)
