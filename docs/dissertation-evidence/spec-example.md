Source: `tests/playwright/httpbookstoscrapecom-browse-all-books-on.spec.ts` (first 40 lines)
Requirement (REQ-01): `http://books.toscrape.com — browse all books on the homepage`

---

```typescript
/**
 * Feature: httpbookstoscrapecom-browse-all-books-on
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  page2Url: '/catalogue/page-2.html',
  page50Url: '/catalogue/page-50.html',
  page51Url: '/catalogue/page-51.html',
  invalidPath: '/nonexistent-page',
  expectedBookCount: 20,
  priceRegex: /^£\d+\.\d{2}$/,
  validRatings: ['One', 'Two', 'Three', 'Four', 'Five'],
  invalidRatings: ['Zero', 'Six'],
  siteName: 'Books to Scrape',
};

class BookListPage {
  constructor(private page: Page) {}

  async navigate() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async navigateTo(path: string) {
    return this.page.goto(path);
  }

  bookItems() {
    return this.page.locator('article.product_pod');
  }

  bookImages() {
    return this.page.locator('article.product_pod img');
  }
```
