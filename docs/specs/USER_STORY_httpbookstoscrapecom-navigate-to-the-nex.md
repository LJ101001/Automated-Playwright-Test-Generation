# User Story: httpbookstoscrapecom-navigate-to-the-nex

## Context
Books to Scrape (http://books.toscrape.com) is a demo book catalogue website; this story covers a visitor navigating from the current catalogue listing page to the next page of results.

## Story
As a site visitor, I want to navigate to the next page of book listings, so that I can browse the full catalogue beyond the books shown on the current page.

## Priority: High

## Acceptance Criteria

### Scenario 1: "Next" control is visible on a page with further results
**Given** a visitor is on a catalogue page that is not the last page
**When** the page finishes loading
**Then** a "next" pagination control is visible and enabled

### Scenario 2: Clicking "next" navigates to the following page
**Given** a visitor is on page 1 of the catalogue
**When** they click the "next" pagination control
**Then** the browser navigates to page 2
**And** the URL reflects page 2 of the catalogue

### Scenario 3: A new set of books is displayed after navigating
**Given** a visitor has clicked "next" from page 1
**When** page 2 finishes loading
**Then** a set of book items is displayed
**And** the books shown are different from those shown on page 1

### Scenario 4: Repeated navigation advances through multiple pages
**Given** a visitor is on page 2 of the catalogue
**When** they click the "next" pagination control again
**Then** the browser navigates to page 3
**And** a new set of book items is displayed, distinct from pages 1 and 2

### Scenario 5: "Next" control is absent on the final page
**Given** a visitor is on the final page of the catalogue
**When** the page finishes loading
**Then** no "next" pagination control is visible, or the control is disabled/absent

### Scenario 6: Page indicator reflects current position
**Given** a visitor has navigated to page 2 via the "next" control
**When** page 2 finishes loading
**Then** a page indicator (e.g. "Page 2 of 50") is visible and shows the correct current page number

## Edge Cases to Cover
- Navigating "next" from the very first page works correctly
- Navigating "next" repeatedly until the last page is reached does not error or produce a blank/duplicate page
- The "next" control is not present or not clickable once the last page is reached
- Direct navigation to a page URL beyond the last page does not produce a 404 or blank catalogue
- Book items on the newly loaded page render fully (title, price, star rating, availability) before assertions run
- Browser back navigation after using "next" returns to the expected prior page and its original book set

## Out of Scope
- Filtering or sorting books by category, rating, or price
- Searching for a book by title
- Adding books to a basket or completing a purchase
- Book detail page content
- Navigating backward via a "previous" control (only incidental, not a primary scenario)

## Assumptions
- **App URL:** http://books.toscrape.com
- The site is a static demo catalogue with no login required; all pages are publicly accessible
- The catalogue is pre-populated with 1000 books across 50 pages (20 books per page) — the known fixed dataset for this demo site
- Test data: no credentials required; tests run as an anonymous visitor
- Page 1 is reachable at the site root; subsequent pages follow the site's own pagination URL pattern (e.g. `catalogue/page-2.html`)
- The site is expected to be available and responsive during test execution
- Tests target a desktop viewport (1280×720 or wider) unless stated otherwise
- The HTML structure follows the established pattern for books.toscrape.com (article elements with class `product_pod` per book; pagination "next" control within an element with class `next`)
