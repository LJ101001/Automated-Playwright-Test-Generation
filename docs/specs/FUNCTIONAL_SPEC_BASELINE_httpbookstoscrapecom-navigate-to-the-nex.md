# Functional Specification: httpbookstoscrapecom-navigate-to-the-nex

## Source
Derived directly from requirement (no upstream USER_STORY file): "http://books.toscrape.com — navigate to the next page of results"

## Application Under Test
- **Name**: Books to Scrape
- **URL**: http://books.toscrape.com
- **Type**: Static HTML demo book catalogue (web scraping practice site; no authentication required)

---

## Functional Requirements

### FR-01: "Next" Pagination Control Is Visible When Further Pages Exist
**Description**: On any catalogue page that is not the last page, a "next" pagination control must be present and visible once the page finishes loading.
**Input**: Rendered catalogue page (e.g. page 1) that is not the final page (page 50)
**Expected Output / State Change**: `li.next > a` is present in the DOM and visible in the viewport.
**Validation Rules**:
- `li.next > a` must exist and be visible on pages 1 through 49
- `li.next > a` must have a non-empty `href` attribute
- Control must not be present with `display:none` or otherwise hidden while purporting to be usable

---

### FR-02: Clicking "Next" Navigates to the Following Page
**Description**: Activating the "next" pagination control from page 1 must move the visitor to page 2, with the URL reflecting the new page.
**Input**: Click on `li.next > a` while on page 1 (`http://books.toscrape.com`)
**Expected Output / State Change**: Browser navigates to a URL containing `page-2` (e.g. `catalogue/page-2.html`); page 2 content renders.
**Validation Rules**:
- Post-click URL must contain `page-2`
- Navigation must complete (page load event fires) within a reasonable timeout
- No JavaScript error or blank page results from the click

---

### FR-03: New Set of Book Items Is Displayed After Navigating to Page 2
**Description**: After navigating from page 1 to page 2, the book items shown must be a distinct set from those shown on page 1.
**Input**: Titles of all `article.product_pod` items on page 1, then on page 2
**Expected Output / State Change**: Page 2 renders between 1 and 20 `article.product_pod` elements whose titles do not overlap with page 1's titles.
**Validation Rules**:
- Page 2 must contain at least 1 `article.product_pod` element
- No title present on page 1 may also appear on page 2
- Each book item on page 2 must render fully (title, price, rating, availability) before comparison

---

### FR-04: Repeated "Next" Navigation Advances Sequentially Through Multiple Pages
**Description**: Clicking "next" again from page 2 must advance the visitor to page 3, demonstrating that pagination works beyond a single hop and continues to serve distinct content.
**Input**: Click on `li.next > a` while on page 2
**Expected Output / State Change**: Browser navigates to a URL containing `page-3`; page 3 renders a further distinct set of `article.product_pod` items.
**Validation Rules**:
- Post-click URL must contain `page-3`
- Page 3 must contain at least 1 `article.product_pod` element
- No title present on page 2 may also appear on page 3
- Sequence page 1 → 2 → 3 must not repeat or skip a page

---

### FR-05: "Next" Control Is Absent on the Last Page
**Description**: On the final catalogue page, no functional "next" control should be present, preventing navigation past the end of the dataset.
**Input**: Rendered final catalogue page (page 50, `catalogue/page-50.html`)
**Expected Output / State Change**: `li.next` element is not present in the DOM.
**Validation Rules**:
- `li.next` must not exist in the DOM on page 50
- `li.previous > a` must still be present on page 50 (visitor can go back)
- No console error occurs from the absence of the control

---

### FR-06: Page Indicator Reflects Current Page Position
**Description**: After navigating to a page via "next", a page indicator must be visible showing the current page number and total page count.
**Input**: Rendered page 2 after clicking "next" from page 1
**Expected Output / State Change**: An element (`.pager .current`) is visible with text matching the pattern `Page \d+ of \d+`, correctly reflecting the current page.
**Validation Rules**:
- Page indicator element must be present and visible
- Text must match regex `^Page \d+ of \d+$`
- The page number component must equal the actual current page (e.g. "Page 2" after navigating once from page 1)
- Total page count must remain consistent (`50`) across navigations

---

### FR-07: Direct Navigation Beyond the Last Page Is Handled Gracefully
**Description**: Requesting a catalogue page URL beyond the last valid page (e.g. page 51 of 50) must not produce a silently broken or blank experience.
**Input**: Direct navigation to `http://books.toscrape.com/catalogue/page-51.html`
**Expected Output / State Change**: The site either returns a clear 404/not-found response, redirects, or otherwise avoids silently rendering an empty catalogue grid with no explanation.
**Validation Rules**:
- Response must not be a silent blank `article.product_pod` grid with zero explanatory content
- If HTTP status is checked, a non-200 (e.g. 404) status is an acceptable and expected outcome
- No unhandled JavaScript error is thrown

---

### FR-08: Browser Back Navigation Restores the Prior Page
**Description**: After using "next" to move from page 1 to page 2, using the browser's back navigation must return the visitor to page 1 with page 1's original book set and controls intact.
**Input**: Navigate page 1 → click "next" → page 2 → trigger browser back navigation
**Expected Output / State Change**: URL returns to the page 1 address (site root or equivalent); page 1's `article.product_pod` set and `li.next` control are restored.
**Validation Rules**:
- URL after back navigation must no longer contain `page-2`
- `article.product_pod` titles after back navigation must match the original page 1 set
- `li.next > a` must be visible again after returning to page 1

---

## UI Elements

| Selector / ID | Element Type | Expected Behaviour |
|---|---|---|
| `article.product_pod` | Article (book card) | Container for each book item; used to compare book sets across pages |
| `article.product_pod h3 > a` | Anchor | Book title link; `title` attribute used as the unique identifier when comparing page sets |
| `li.next > a` | Anchor (pagination) | "Next" link; visible on pages 1–49; absent on page 50 |
| `li.previous > a` | Anchor (pagination) | "Previous" link; absent on page 1; present on pages 2–50 |
| `ul.pager` | List | Pagination container holding next/previous links and the page indicator |
| `.pager .current` | List item | Page indicator text, e.g. "Page 2 of 50" |

---

## Test Scenarios

### TS-01: "Next" Control Visible on Page 1 [FR-01]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Network access to http://books.toscrape.com
- **Test Data**: URL = `http://books.toscrape.com`
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Wait for page to fully load
  3. Assert `li.next > a` is present and visible
- **Expected Result**: "next" control is visible with a valid, non-empty `href`

---

### TS-02: "Next" Control Not Falsely Hidden on a Valid Page [FR-01]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Page 1 loaded
- **Test Data**: `li.next` computed style
- **Steps**:
  1. Navigate to page 1
  2. Read computed `display`/`visibility` of `li.next`
  3. Assert it is not `none` / `hidden`
- **Expected Result**: The control is not present-but-invisible; a visitor can actually see and use it

---

### TS-03: "Next" Control Still Visible One Page Before the Boundary [FR-01]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access to `catalogue/page-49.html`
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-49.html`
- **Steps**:
  1. Navigate directly to page 49 (the last page before the final page)
  2. Assert `li.next > a` is present and visible
- **Expected Result**: "next" control is still visible immediately before the boundary where it disappears

---

### TS-04: Clicking "Next" from Page 1 Navigates to Page 2 [FR-02]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded; `li.next > a` visible
- **Test Data**: None
- **Steps**:
  1. Navigate to `http://books.toscrape.com`
  2. Click `li.next > a`
  3. Wait for navigation to complete
  4. Assert URL contains `page-2`
- **Expected Result**: URL updates to reflect page 2 (e.g. `catalogue/page-2.html`)

---

### TS-05: Clicking "Next" Does Not Leave URL Unchanged [FR-02]
- **Type**: Negative
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: URL before and after click
- **Steps**:
  1. Record URL on page 1
  2. Click `li.next > a`
  3. Compare pre- and post-click URLs
- **Expected Result**: Post-click URL differs from pre-click URL and contains `page-2`

---

### TS-06: Rapid Double-Click on "Next" Does Not Skip a Page [FR-02]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Homepage loaded
- **Test Data**: Double-click event on `li.next > a`
- **Steps**:
  1. Navigate to page 1
  2. Rapidly click `li.next > a` twice in quick succession
  3. Assert final URL contains `page-2` (not `page-3`)
- **Expected Result**: A single logical navigation occurs; the second click either lands on page 2's "next" link or is a no-op, not an unexpected skip to page 3

---

### TS-07: New Book Set Displayed After Navigating to Page 2 [FR-03]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Page 1 loaded; titles collected
- **Test Data**: All 20 page-1 book titles
- **Steps**:
  1. Navigate to page 1; collect all `article.product_pod h3 > a` titles
  2. Click `li.next > a`; wait for page 2 to load
  3. Collect all page-2 `article.product_pod h3 > a` titles
  4. Assert no title from page 1 appears in the page-2 set
- **Expected Result**: Page 2 shows a completely distinct set of books from page 1

---

### TS-08: Page 2 Is Not a Duplicate or Empty Render of Page 1 [FR-03]
- **Type**: Negative
- **Priority**: High
- **Preconditions**: Page 1 loaded
- **Test Data**: Page 1 and page 2 title arrays
- **Steps**:
  1. Collect page 1 titles
  2. Navigate via "next" to page 2
  3. Assert page 2 title array is neither identical to page 1's nor empty
- **Expected Result**: Page 2 renders its own distinct, non-empty book set

---

### TS-09: Page 2 Book Count Is Within Expected Bounds [FR-03]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Navigated to page 2
- **Test Data**: Count of `article.product_pod` on page 2
- **Steps**:
  1. Navigate via "next" to page 2
  2. Count `article.product_pod` elements
  3. Assert count is between 1 and 20 inclusive
- **Expected Result**: Page 2 contains at least 1 and at most 20 book items

---

### TS-10: Clicking "Next" Twice Advances Page 1 → 2 → 3 [FR-04]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: None
- **Steps**:
  1. Navigate to page 1
  2. Click `li.next > a`; assert URL contains `page-2`
  3. Click `li.next > a` again; assert URL contains `page-3`
  4. Collect titles on page 3; assert no overlap with page 2's titles
- **Expected Result**: Sequential navigation reaches page 3 with a further distinct book set

---

### TS-11: Repeated Navigation Does Not Revisit a Previously Seen Page [FR-04]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Homepage loaded
- **Test Data**: URLs visited across 3 consecutive "next" clicks
- **Steps**:
  1. Navigate to page 1
  2. Click "next" three times, recording the URL after each click
  3. Assert the three recorded URLs are all distinct (`page-2`, `page-3`, `page-4`)
- **Expected Result**: No page URL is visited twice during sequential forward navigation

---

### TS-12: Navigating "Next" From the Second-to-Last Page Reaches the Last Page Without Error [FR-04]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access to page 49
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-49.html`
- **Steps**:
  1. Navigate directly to `catalogue/page-49.html`
  2. Click `li.next > a`
  3. Assert URL contains `page-50`
  4. Assert `article.product_pod` items are rendered (not blank)
- **Expected Result**: Final forward navigation to page 50 succeeds without error or blank content

---

### TS-13: "Next" Control Absent on the Last Page [FR-05]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Network access to page 50
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-50.html`
- **Steps**:
  1. Navigate directly to page 50
  2. Assert `li.next` is not present in the DOM
- **Expected Result**: No "next" control exists on the final page

---

### TS-14: "Previous" Control Still Present on the Last Page [FR-05]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Page 50 loaded
- **Test Data**: `li.previous > a`
- **Steps**:
  1. Navigate to page 50
  2. Assert `li.previous > a` is present and visible
- **Expected Result**: Absence of "next" does not also remove "previous"; visitor can still navigate backward

---

### TS-15: The "Next" Control Disappears Exactly at the Last Page, Not Early [FR-05]
- **Type**: Boundary
- **Priority**: Medium
- **Preconditions**: Network access to page 49
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-49.html`
- **Steps**:
  1. Navigate to page 49; assert `li.next > a` IS present
  2. Navigate to page 50; assert `li.next` is NOT present
- **Expected Result**: The "next" control disappears exactly at the last page, not one page early or late

---

### TS-16: Page Indicator Shows "Page 2 of 50" After One "Next" Click [FR-06]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Homepage loaded
- **Test Data**: Expected indicator text pattern
- **Steps**:
  1. Navigate to page 1; click `li.next > a`
  2. Wait for page 2 to load
  3. Read `.pager .current` text
  4. Assert text matches `Page 2 of 50`
- **Expected Result**: Page indicator correctly shows the current page and total count

---

### TS-17: Page Indicator Does Not Retain the Prior Page's Value [FR-06]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Navigated from page 1 to page 2
- **Test Data**: `.pager .current` text before and after navigation
- **Steps**:
  1. Record indicator text on page 1 ("Page 1 of 50")
  2. Click "next"; wait for page 2 to load
  3. Assert indicator text has changed and no longer reads "Page 1 of 50"
- **Expected Result**: Indicator updates to reflect the new page; it does not retain the previous page's value

---

### TS-18: Page Indicator Format Is Well-Formed at the Final Boundary Page [FR-06]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Network access to page 50
- **Test Data**: `.pager .current` text on page 50
- **Steps**:
  1. Navigate directly to page 50
  2. Read `.pager .current` text
  3. Assert it matches `^Page \d+ of \d+$` and the page number equals 50
- **Expected Result**: Indicator correctly reads "Page 50 of 50" at the final boundary

---

### TS-19: Direct Navigation Beyond the Last Page Does Not Show a Blank Grid [FR-07]
- **Type**: Positive
- **Priority**: Medium
- **Preconditions**: Network access
- **Test Data**: URL = `http://books.toscrape.com/catalogue/page-51.html`
- **Steps**:
  1. Navigate directly to `catalogue/page-51.html`
  2. Assert the response is not a silent, unexplained empty `article.product_pod` grid
- **Expected Result**: Site returns a 404/not-found indication or otherwise communicates the page does not exist

---

### TS-20: Page Beyond the Last Does Not Silently Duplicate the Last Valid Page's Content [FR-07]
- **Type**: Negative
- **Priority**: Low
- **Preconditions**: Page 50 titles collected
- **Test Data**: Page 50 and page 51 title sets
- **Steps**:
  1. Collect titles from page 50
  2. Navigate to page 51
  3. Assert page 51 does not render an identical copy of page 50's book set as if it were valid
- **Expected Result**: Beyond-range page does not silently re-serve the last valid page's content as a false positive

---

### TS-21: Page 50 Is Valid While Page 51 Is the True Failure Boundary [FR-07]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Network access
- **Test Data**: `page-50.html` vs `page-51.html`
- **Steps**:
  1. Navigate to page 50; assert catalogue renders normally
  2. Navigate to page 51; assert catalogue does not render normally
- **Expected Result**: Page 50 is valid, page 51 is the exact boundary where behaviour changes

---

### TS-22: Browser Back Returns to Page 1 After Using "Next" [FR-08]
- **Type**: Positive
- **Priority**: High
- **Preconditions**: Navigated from page 1 to page 2 via "next"
- **Test Data**: Page 1 titles recorded before navigating forward
- **Steps**:
  1. Navigate to page 1; record titles and URL
  2. Click `li.next > a`; confirm URL contains `page-2`
  3. Trigger browser back navigation
  4. Assert URL no longer contains `page-2`
  5. Assert `article.product_pod` titles match the originally recorded page 1 set
- **Expected Result**: Back navigation fully restores page 1's URL and content

---

### TS-23: "Next" Control Is Available Again After Navigating Back [FR-08]
- **Type**: Negative
- **Priority**: Medium
- **Preconditions**: Completed forward-then-back navigation (page 1 → 2 → back to 1)
- **Test Data**: `li.next > a` state after back navigation
- **Steps**:
  1. Perform page 1 → "next" → page 2 → browser back
  2. Assert `li.next > a` is present and visible again
- **Expected Result**: The "next" control is not left missing or stale after returning via back navigation

---

### TS-24: Back Then Forward Restores Page 2 State [FR-08]
- **Type**: Boundary
- **Priority**: Low
- **Preconditions**: Navigated page 1 → 2 → back to page 1
- **Test Data**: Page 2 titles recorded before going back
- **Steps**:
  1. Navigate page 1 → "next" → page 2; record page 2 titles
  2. Trigger browser back (returns to page 1)
  3. Trigger browser forward
  4. Assert URL contains `page-2` again and titles match the originally recorded page 2 set
- **Expected Result**: Forward navigation after back correctly restores page 2, completing the round trip

---

## Test Data Summary

| Data Set | Values | Purpose |
|---|---|---|
| Homepage / page 1 URL | `http://books.toscrape.com` | Starting point for all navigation scenarios |
| Page 2 URL | `http://books.toscrape.com/catalogue/page-2.html` | First-hop "next" navigation target |
| Page 3 URL | `http://books.toscrape.com/catalogue/page-3.html` | Second-hop "next" navigation target |
| Page 49 URL | `http://books.toscrape.com/catalogue/page-49.html` | One-before-last boundary |
| Last page URL | `http://books.toscrape.com/catalogue/page-50.html` | Boundary — "next" absent |
| Beyond-last-page URL | `http://books.toscrape.com/catalogue/page-51.html` | Boundary — graceful beyond-end behaviour |
| Total pages | `50` | Known dataset size used in page-indicator assertions |
| Books per page | up to `20` | Bound for per-page item count assertions |
| Page indicator regex | `^Page \d+ of \d+$` | FR-06 format validation |
| Viewport | `1280 × 720` (desktop) | All tests run at this minimum width |
| Credentials | None | Anonymous visitor; no login required |

---

## Dependencies / Environment

- **Network**: Live HTTP access to `http://books.toscrape.com` required from the test runner; no HTTPS; no authentication
- **Browser**: Chromium (Playwright default); desktop viewport 1280 × 720; browser back/forward navigation must be exercisable (`page.goBack()` / `page.goForward()`)
- **JavaScript**: Site is static HTML/CSS; no JS-only content rendering; Playwright may use JS for assertions
- **No test accounts**: Zero credentials required; all pages publicly accessible
- **Selectors**: Books to Scrape has no `data-test` attributes; selectors above are the site's actual CSS classes/structure and should be confirmed against the live DOM before implementation
- **Known fixture state**: 1000 books, 50 pages, 20 per page — stable for this demo site; page 50 is the fixed last-page boundary used for negative/boundary assertions
- **No prior state**: Each test navigates fresh; no session state or cookies need to be cleared, except where a test explicitly builds up navigation history for back/forward assertions
- **Scope boundary**: Forward ("next") pagination across pages 1–50, the last-page boundary, one-page-beyond-last behaviour, and browser back/forward integrity are in scope; filtering, sorting, search, basket/checkout, and book detail page content are out of scope
