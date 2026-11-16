# Functional Specification: httpbookstoscrapecom-filter-books-by-the

## Source
Derived directly from requirement (no upstream USER_STORY file): "http://books.toscrape.com — filter books by the Mystery category"

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Static HTML book catalogue demo site; no authentication, no real checkout

---

## Functional Requirements

### FR-01: Mystery Category Link Is Present in the Sidebar
**Description**: The category sidebar, rendered on every page of the site, must expose a "Mystery" link that a user can select to filter the catalogue.
**Input**: Rendered page (homepage or any other page showing the sidebar)
**Expected Output / State Change**: A sidebar link with the exact visible text "Mystery" is present and clickable.
**Validation Rules**:
- Exactly one sidebar link has the exact text "Mystery" (not "Crime", "Thriller", or similar)
- The link is visible and has a non-empty `href`
- The link is present regardless of which page currently renders the sidebar

---

### FR-02: Selecting Mystery Navigates to the Mystery Category Page
**Description**: Clicking the "Mystery" sidebar link must take the user to a category-scoped listing page containing only Mystery books.
**Input**: Click on the "Mystery" sidebar link
**Expected Output / State Change**: Browser navigates to the Mystery category URL (expected pattern `/catalogue/category/books/mystery_3/index.html`); page returns HTTP 200.
**Validation Rules**:
- Resulting URL contains `category/books/mystery`
- Response status is 200
- Navigation is idempotent — clicking the link again from the resulting page returns to the same URL without error

---

### FR-03: Mystery Category Page Heading Confirms the Active Filter
**Description**: The category page must clearly identify itself as the Mystery category so the user can confirm the filter was applied.
**Input**: Rendered Mystery category page
**Expected Output / State Change**: The page heading element displays the text "Mystery".
**Validation Rules**:
- Heading text equals "Mystery" exactly (case-sensitive)
- Heading is present and visible before any book-list assertions are made

---

### FR-04: Only Mystery Books Appear in the Filtered Results
**Description**: Every book listed on the Mystery category page (and any of its pagination pages) must belong to the Mystery category; no books from other categories may leak into the results.
**Input**: Rendered book list on the Mystery category page, including subsequent pagination pages reached from it
**Expected Output / State Change**: The full set of `article.product_pod` items on every page of the Mystery listing corresponds only to Mystery books.
**Validation Rules**:
- No listed item belongs to a different category than Mystery
- The category filter persists across pagination — page 2, 3, etc. reached from the Mystery listing continue to show only Mystery books
- If the category has zero results, the page renders without error and communicates zero results rather than showing a broken or blank grid

---

### FR-05: Result Count Reflects the Number of Mystery Books
**Description**: The results indicator near the page heading must accurately state how many books are in the Mystery category.
**Input**: Page load of the Mystery category page (page 1)
**Expected Output / State Change**: A numeric results count is displayed adjacent to the heading.
**Validation Rules**:
- Count is a non-negative integer
- Count matches the actual total number of Mystery book listings across all paginated pages
- A zero count still renders the page without error

---

### FR-06: Each Filtered Book Listing Shows Standard Catalogue Information
**Description**: Book cards on the Mystery category page must expose the same information as the main catalogue: title, price, and stock availability.
**Input**: A rendered `article.product_pod` item on the Mystery category page
**Expected Output / State Change**: Each item shows a non-empty title, a correctly formatted price, and an availability label.
**Validation Rules**:
- Title text/`title` attribute is non-empty
- Price text matches `^£\d+\.\d{2}$`
- `.availability` text is non-empty and contains "In stock" or "Out of stock" (case-insensitive)

---

### FR-07: Selecting a Filtered Book Navigates to Its Correct Detail Page
**Description**: Clicking a book's title within the Mystery results must open that exact book's detail page, not an unrelated one.
**Input**: Click on `article.product_pod h3 > a` within the Mystery listing
**Expected Output / State Change**: Browser navigates to a `/catalogue/` detail page whose heading matches the clicked listing's title.
**Validation Rules**:
- Resulting URL contains `/catalogue/`
- Detail page response status is 200
- Detail page heading text matches the source listing's title exactly

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---|---|---|
| `.side_categories ul.nav-list li ul li a` (text "Mystery") | Anchor | Navigates to the Mystery category listing page |
| `.page-header.action h1` | Heading | Displays "Mystery" on the category page |
| `.form-horizontal strong` (first match) | Text label | Displays the numeric Mystery results count |
| `article.product_pod` | Article (book card) | One per Mystery book; repeated per page |
| `article.product_pod h3 > a` | Anchor | Book title link; `title` attribute holds full title; navigates to detail page |
| `article.product_pod .price_color` | Paragraph | Price text matching `^£\d+\.\d{2}$` |
| `article.product_pod .availability` | Paragraph | "In stock" / "Out of stock" text |
| `.pager .next > a` | Anchor (pagination) | Advances to next page of Mystery results; absent on last page |
| `.product_main h1` | Heading | Product detail page title; must match the source listing's title |
| Mystery category URL | Page/route | Expected pattern `/catalogue/category/books/mystery_3/index.html`; exact path confirmed against the live site during implementation |

---

## Test Scenarios

### TS-01: Mystery Link Present in Sidebar [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Link text = "Mystery"
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Locate the category sidebar
  3. Assert a link with exact text "Mystery" is visible with a non-empty `href`
- **Expected Result**: Exactly one "Mystery" link is present and clickable

---

### TS-02: Sidebar Does Not Conflate Mystery With Similar Categories [FR-01]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded; sidebar lists multiple categories
- **Test Data**: Category names "Mystery", "Crime", "Thriller"
- **Steps**:
  1. Navigate to homepage
  2. Count sidebar links whose text exactly equals "Mystery"
- **Expected Result**: Exactly one match; no other category link is mistaken for Mystery

---

### TS-03: Clicking Mystery Navigates to the Category Page [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: None
- **Steps**:
  1. Navigate to homepage
  2. Click the "Mystery" sidebar link
  3. Assert resulting URL contains `category/books/mystery`
  4. Assert response status 200
- **Expected Result**: Browser lands on the Mystery category page with HTTP 200

---

### TS-04: Invalid Category URL Does Not Show a Mystery Listing — Boundary [FR-02]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Network access available
- **Test Data**: URL = `http://books.toscrape.com/catalogue/category/books/mystery_999/index.html`
- **Steps**:
  1. Navigate directly to a mystery-like but incorrect category URL
  2. Assert the page does not render a valid Mystery book grid matching the real category
- **Expected Result**: Page shows a 404/error or empty state, not a false-positive Mystery listing

---

### TS-05: Mystery Category Heading Confirms the Filter [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Mystery category page loaded
- **Test Data**: None
- **Steps**:
  1. Navigate to the Mystery category page
  2. Read the page heading text
- **Expected Result**: Heading text equals "Mystery" exactly

---

### TS-06: Heading Does Not Silently Default to All-Books Title — Boundary [FR-03]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Mystery category page loaded
- **Test Data**: Homepage heading/title for comparison
- **Steps**:
  1. Navigate to the Mystery category page
  2. Assert the heading is "Mystery", not the generic catalogue/homepage title
- **Expected Result**: Heading is category-specific, not the unfiltered catalogue heading

---

### TS-07: All Displayed Books Belong to Mystery [FR-04]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Mystery category page loaded with at least one result
- **Test Data**: None
- **Steps**:
  1. Navigate to the Mystery category page
  2. Collect all `article.product_pod` items
  3. Cross-check a sample of listings against their own detail pages for category membership
- **Expected Result**: Every listed book is confirmed Mystery; no other-category books appear

---

### TS-08: Filter Persists Across Pagination — Boundary [FR-04]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Mystery category has more than one page of results
- **Test Data**: None
- **Steps**:
  1. Navigate to the Mystery category page
  2. Click `.pager .next > a`
  3. Assert the resulting page's items are still Mystery-scoped and heading still reads "Mystery"
- **Expected Result**: Category filter is preserved across pagination

---

### TS-09: Zero-Result Category State Handled Gracefully [FR-04]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: A category URL known/simulated to return zero results
- **Test Data**: A zero-result category path, used as a boundary proxy for the Mystery filter's empty-state handling
- **Steps**:
  1. Navigate to the zero-result category page
  2. Observe rendering
- **Expected Result**: Page loads without error; clearly indicates no books found rather than a broken/blank grid

---

### TS-10: Results Count Matches Actual Listings [FR-05]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Mystery category page loaded
- **Test Data**: None
- **Steps**:
  1. Navigate to the Mystery category page
  2. Read the displayed results count
  3. Count actual book listings across all pages of the Mystery category
- **Expected Result**: Displayed count equals the total counted listings

---

### TS-11: Results Count Is Not Off-by-One — Boundary [FR-05]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Mystery category page loaded
- **Test Data**: Actual counted total N
- **Steps**:
  1. Navigate to the Mystery category page
  2. Read displayed count
  3. Assert displayed count is neither N-1 nor N+1, but exactly N
- **Expected Result**: Count exactly matches N with no off-by-one error

---

### TS-12: Every Mystery Listing Shows Title, Price, and Availability [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Mystery category page loaded with at least one result
- **Test Data**: None
- **Steps**:
  1. Navigate to the Mystery category page
  2. For each `article.product_pod`, assert non-empty title, price matching `^£\d+\.\d{2}$`, non-empty availability text
- **Expected Result**: All items pass all three field checks

---

### TS-13: No Listing Is Missing Required Fields [FR-06]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Mystery category page loaded
- **Test Data**: None
- **Steps**:
  1. Navigate to the Mystery category page
  2. Assert zero items have an empty title, malformed price, or missing availability element
- **Expected Result**: Zero listings fail the field-presence checks

---

### TS-14: Clicking a Mystery Listing Opens the Matching Detail Page [FR-07]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Mystery category page loaded with at least one result
- **Test Data**: First listing's title text
- **Steps**:
  1. Navigate to the Mystery category page
  2. Record the first listing's title
  3. Click the first listing's title link
  4. Assert URL contains `/catalogue/` and response status 200
  5. Assert detail page heading matches the recorded title
- **Expected Result**: Detail page loads and its heading matches the source listing exactly

---

### TS-15: Detail Navigation Does Not Leak to an Unrelated Product — Boundary [FR-07]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Mystery category page loaded with at least two results
- **Test Data**: Titles of first and second listings
- **Steps**:
  1. Navigate to the Mystery category page
  2. Record titles of the first and second listings
  3. Click the first listing's title link
  4. Assert resulting detail heading matches the first title, not the second
- **Expected Result**: Detail page corresponds only to the clicked listing

---

## Test Data Summary

| Data Set | Values | Purpose |
|---|---|---|
| Target category | "Mystery" | Primary filter under test |
| Distractor categories | "Crime", "Thriller" | Rule out sidebar link conflation (TS-02) |
| Mystery category URL | `/catalogue/category/books/mystery_3/index.html` (to confirm against live site) | Direct navigation / URL assertions |
| Invalid category URL | `/catalogue/category/books/mystery_999/index.html` | Boundary — incorrect category ID handling (TS-04) |
| Price regex | `^£\d+\.\d{2}$` | FR-06 format validation |
| Availability values | `In stock`, `Out of stock` | FR-06 content validation |
| Pagination pages | Page 1..N of Mystery category | Filter persistence across pagination (TS-08) |
| Zero-result category | A live/simulated category with 0 books | Empty-state handling (TS-09) |
| Viewport | 1280 × 720 (desktop) | Default test viewport |
| Credentials | None | Anonymous browsing; no login required |

---

## Dependencies / Environment

- **Network**: Live HTTP access to `http://books.toscrape.com`; no HTTPS; no authentication
- **Browser**: Chromium (Playwright default); desktop viewport 1280 × 720
- **JavaScript**: Site is static HTML/CSS; assertions may use JS but rendering does not depend on it
- **No test accounts**: All pages are publicly accessible
- **Category data**: Assumed static for the duration of testing; exact Mystery result count and page count must be confirmed against the live site rather than hardcoded from assumption
- **Selectors**: Books to Scrape has no `data-test` attributes; selectors above are the site's actual CSS classes/structure and should be confirmed against the live DOM before implementation
- **Scope boundary**: Sidebar navigation, the Mystery category listing (and its pagination), and detail-page navigation from that listing are in scope; search, basket, and account pages are out of scope
