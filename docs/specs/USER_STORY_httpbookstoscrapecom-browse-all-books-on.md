# User Story: httpbookstoscrapecom-browse-all-books-on

## Context
Books to Scrape (http://books.toscrape.com) is a catalogue website; this story covers a visitor browsing all available books displayed on the homepage.

## Story
As a site visitor, I want to browse all books listed on the homepage, so that I can discover and evaluate available titles without needing to search or filter.

## Priority: High

## Acceptance Criteria

### Scenario 1: Homepage loads and displays a book catalogue
**Given** a visitor navigates to the homepage
**When** the page finishes loading
**Then** a grid or list of book items is visible
**And** each book item displays at least a cover image and a title

### Scenario 2: Each book shows its star rating
**Given** a visitor is viewing the homepage book catalogue
**When** they inspect any individual book item
**Then** a star rating (one through five stars) is displayed alongside the book

### Scenario 3: Each book shows its price
**Given** a visitor is viewing the homepage book catalogue
**When** they inspect any individual book item
**Then** a price in GBP (£) format is displayed for that book

### Scenario 4: Each book shows its availability status
**Given** a visitor is viewing the homepage book catalogue
**When** they inspect any individual book item
**Then** an in-stock or out-of-stock availability label is displayed

### Scenario 5: Correct number of books displayed per page
**Given** a visitor is on the homepage
**When** the catalogue has rendered
**Then** exactly 20 book items are visible on the page

### Scenario 6: Pagination is present when more books exist
**Given** the catalogue contains more than 20 books
**When** the visitor views the homepage
**Then** pagination controls are visible (e.g. "next" button or page numbers)

### Scenario 7: Visitor can navigate to the next page of books
**Given** the visitor is on page 1 of the catalogue
**When** they click the "next" pagination control
**Then** the browser navigates to page 2
**And** a new set of book items is displayed

### Scenario 8: Book title links to a detail page
**Given** a visitor is viewing the homepage book catalogue
**When** they click on a book's title or cover image
**Then** they are taken to that book's individual detail page

### Scenario 9: Page title and heading identify the site
**Given** a visitor navigates to the homepage
**When** the page finishes loading
**Then** the page title or main heading contains text identifying this as "Books to Scrape" or a book catalogue

## Edge Cases to Cover
- Homepage loads successfully with no JavaScript errors
- All 20 book images resolve (no broken image links)
- Books with long titles are not truncated in a way that hides the full title link
- Rating value is machine-readable (e.g. a CSS class or `aria` attribute) as well as visually presented
- Price value is parseable as a number (i.e. not malformed currency string)
- Navigating beyond the last page does not produce a 404 or blank catalogue

## Out of Scope
- Filtering or sorting books by category, rating, or price
- Adding books to a basket or completing a purchase
- User authentication or account management
- Search functionality
- Book detail page content beyond confirming navigation lands on the correct page

## Assumptions
- **App URL:** http://books.toscrape.com
- The site is a static demo catalogue with no login required; all pages are publicly accessible
- The catalogue is pre-populated with 1000 books across 50 pages (20 books per page) — this is the known dataset for this demo site
- Test data: no credentials required; tests run as an anonymous visitor
- The site is expected to be available and responsive during test execution
- Tests target a desktop viewport (1280×720 or wider) unless stated otherwise
- The HTML structure follows the pattern used by the books.toscrape.com demo site (article elements with class `product_pod` per book)
