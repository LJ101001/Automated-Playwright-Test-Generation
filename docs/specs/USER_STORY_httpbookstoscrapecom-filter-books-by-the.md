# User Story: httpbookstoscrapecom-filter-books-by-the

## Context
Books to Scrape (http://books.toscrape.com) is a static book-catalogue demo site; this specification covers a shopper filtering the catalogue down to the Mystery category.

## Story
As a shopper browsing the book catalogue, I want to filter the book list to show only books in the Mystery category, so that I can quickly find books relevant to my interests without scanning the entire catalogue.

## Priority: High

## Acceptance Criteria

### Scenario 1: Navigate to the Mystery category from the homepage
**Given** the shopper is on the Books to Scrape homepage
**When** the shopper selects "Mystery" from the category navigation list
**Then** the shopper is taken to a page listing only books belonging to the Mystery category

### Scenario 2: Category page displays correct results
**Given** the shopper has navigated to the Mystery category page
**When** the page finishes loading
**Then** the page heading identifies the category as "Mystery"
**And** every book displayed on the page belongs to the Mystery category
**And** the displayed result count matches the number of books actually shown/paginated for Mystery

### Scenario 3: Each listed book retains standard catalogue information
**Given** the shopper is viewing the filtered Mystery category page
**When** the shopper inspects a book listing in the results
**Then** the listing displays the book's title, price, and in-stock availability, consistent with the main catalogue view

### Scenario 4: Navigating to a book from the filtered list preserves product detail accuracy
**Given** the shopper is viewing the filtered Mystery category page
**When** the shopper clicks on a book title in the results
**Then** the shopper is taken to that book's product detail page
**And** the product detail page shows the same title as shown in the filtered list

### Scenario 5: Category filter is reachable from any page via the sidebar
**Given** the shopper is on any page of the site that displays the category navigation sidebar
**When** the shopper selects "Mystery" from that sidebar
**Then** the shopper is taken to the Mystery category page, regardless of the page they started from

## Edge Cases to Cover
- Mystery category page is reached but contains zero results (should not error; should indicate no books found if this occurs)
- Mystery category results span multiple pages (pagination) — the category filter must persist across pages
- Category name in navigation must be matched exactly ("Mystery") and not conflated with similarly named or adjacent categories (e.g. "Crime", "Thriller")
- Direct navigation to the Mystery category URL (if guessable/bookmarked) without going through the homepage first
- Category link is clicked multiple times in succession (double navigation / repeated filter application)

## Out of Scope
- Filtering by multiple categories simultaneously
- Combining the category filter with search, sorting, or price-range filters
- Verifying the correctness of Books to Scrape's underlying category data/taxonomy
- Performance/load testing of the category filter

## Assumptions
- WEBSITE_URL: http://books.toscrape.com
- No authentication or login is required; the site is fully public and read-only (a static demo/scraping sandbox)
- No test account credentials are needed
- The "Mystery" category is expected to be listed among the standard category navigation links available on the homepage and site-wide sidebar
- Category and catalogue data on the live site is static/stable for the duration of testing (Books to Scrape is a fixed demo dataset, not subject to real-time inventory changes)
- No cart or checkout interaction is involved in this feature
