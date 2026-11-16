# User Story: httpbookstoscrapecom-view-a-book-detail-

## Context
Books to Scrape (http://books.toscrape.com) is a catalogue website; this story covers a visitor viewing an individual book's detail page and verifying its title, price, and availability information.

## Story
As a site visitor, I want to view a book's detail page and see its title, price, and availability, so that I can decide whether the book meets my needs before considering a purchase.

## Priority: High

## Acceptance Criteria

### Scenario 1: Book detail page displays the book title
**Given** a visitor navigates to an individual book's detail page
**When** the page finishes loading
**Then** the book's full title is displayed prominently on the page

### Scenario 2: Book detail page displays the price
**Given** a visitor is viewing a book's detail page
**When** they inspect the page
**Then** a price in GBP (£) format is displayed
**And** the price matches the price shown for that same book on the catalogue/listing page

### Scenario 3: Book detail page displays availability status
**Given** a visitor is viewing a book's detail page
**When** they inspect the page
**Then** an availability label is displayed indicating whether the book is in stock or out of stock
**And** if in stock, the label includes the number of copies available

### Scenario 4: Book detail page displays a product description
**Given** a visitor is viewing a book's detail page
**When** they inspect the page
**Then** a product description or synopsis text is visible

### Scenario 5: Book detail page displays a star rating
**Given** a visitor is viewing a book's detail page
**When** they inspect the page
**Then** a star rating (one through five stars) is displayed for the book

### Scenario 6: Book detail page displays a product information table
**Given** a visitor is viewing a book's detail page
**When** they inspect the page
**Then** a product information table is visible containing fields such as UPC, price (excl. tax), price (incl. tax), tax, availability, and number of reviews

### Scenario 7: Navigating from the catalogue reaches the correct detail page
**Given** a visitor is on the homepage or a catalogue listing page
**When** they click a specific book's title or cover image
**Then** they land on the detail page for that exact book
**And** the title shown on the detail page matches the title they clicked

### Scenario 8: Book detail page displays a cover image
**Given** a visitor is viewing a book's detail page
**When** the page finishes loading
**Then** a cover image for the book is visible and resolves without error

## Edge Cases to Cover
- Book detail page loads successfully with no JavaScript errors
- Books with long titles (including those with special characters, apostrophes, or ampersands) render the full title without truncation that hides text
- Price value on the detail page is parseable as a number (not a malformed currency string)
- Availability count of zero is handled distinctly from a general "out of stock" label
- Product description text that is very short or contains only boilerplate is still detected as present
- Detail page URL follows a predictable, book-specific pattern so each book has a stable, unique page
- Navigating directly to a detail page URL (not via catalogue click-through) still renders all required fields

## Out of Scope
- Adding the book to a basket or completing a purchase
- User authentication or account management
- Filtering, sorting, or searching the catalogue
- Homepage/catalogue-level pagination or browsing behaviour beyond the single click-through needed to reach a detail page
- Submitting or viewing user-generated reviews

## Assumptions
- **App URL:** http://books.toscrape.com
- The site is a static demo catalogue with no login required; all pages are publicly accessible
- Test data: no credentials required; tests run as an anonymous visitor
- A specific book will be selected from the homepage catalogue (e.g. the first book listed) as the target for detail-page verification, since the demo dataset does not designate a single canonical "test" book
- The site is expected to be available and responsive during test execution
- Tests target a desktop viewport (1280×720 or wider) unless stated otherwise
- The HTML structure follows the pattern used by the books.toscrape.com demo site (detail pages under a `/catalogue/<book-slug>_<id>/index.html` path, with a `product_main` section and a `table.table-striped` product information table)
