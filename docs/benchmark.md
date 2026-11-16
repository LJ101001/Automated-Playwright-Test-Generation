# Benchmark Requirements — Books to Scrape

Dissertation: Lewis Watson, 40619754, Edinburgh Napier University
Target application: http://books.toscrape.com

Eight requirements covering the primary user journeys on Books to Scrape.
Each line is ready to paste into `./qa-pipeline` or `./qa-baseline`.

---

## Requirements

1. `"http://books.toscrape.com — browse all books on the homepage"`

2. `"http://books.toscrape.com — filter books by the Mystery category"`

3. `"http://books.toscrape.com — view a book detail page and verify title price and availability"`

4. `"http://books.toscrape.com — add a book to the basket from the product page"`

5. `"http://books.toscrape.com — navigate to the next page of results"`

6. `"http://books.toscrape.com — sort books by price low to high"`

7. `"http://books.toscrape.com — browse the Travel subcategory"`

8. `"http://books.toscrape.com — verify a book star rating is displayed on the detail page"`

---

## Scenario Coverage

| # | Requirement | Scenario Type |
|---|-------------|---------------|
| 1 | Browse all books on the homepage | Homepage / catalogue display |
| 2 | Filter books by the Mystery category | Category navigation / filtering |
| 3 | View a book detail page and verify title, price, and availability | Product detail / data verification |
| 4 | Add a book to the basket from the product page | Shopping basket / state change |
| 5 | Navigate to the next page of results | Pagination |
| 6 | Sort books by price low to high | Sorting |
| 7 | Browse the Travel subcategory | Subcategory navigation |
| 8 | Verify a book star rating is displayed on the detail page | Rating display / UI element |
