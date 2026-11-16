# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: baseline-httpbookstoscrapecom-navigate-to-the-nex-fault.spec.ts >> Books to Scrape — navigate to the next page of results >> TC-005-P: repeated next clicks advance sequentially through pages 1, 2 and 3
- Location: tests/playwright/baseline-httpbookstoscrapecom-navigate-to-the-nex-fault.spec.ts:114:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('li.next a')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]: "Proxy error: read ETIMEDOUT"
```

# Test source

```ts
  1   | /**
  2   |  * Feature: baseline-httpbookstoscrapecom-navigate-to-the-nex
  3   |  * Agent: Single-Agent Baseline
  4   |  * Dissertation: Lewis Watson, 40619754
  5   |  * Condition: single-agent (no role decomposition)
  6   |  */
  7   | import { test, expect, type Page, type Locator } from '@playwright/test';
  8   | 
  9   | test.use({ baseURL: 'http://localhost:3001' });
  10  | 
  11  | const TEST_DATA = {
  12  |   homePath: '/index.html',
  13  |   page1Path: '/catalogue/page-1.html',
  14  |   page2Path: '/catalogue/page-2.html',
  15  |   page3Path: '/catalogue/page-3.html',
  16  |   lastPagePath: '/catalogue/page-50.html',
  17  |   nonexistentPagePath: '/catalogue/page-51.html',
  18  |   expectedProductsPerPage: 20,
  19  |   expectedPageHeading: 'All products',
  20  |   page1IndicatorText: 'Page 1 of 50',
  21  |   page2IndicatorText: 'Page 2 of 50',
  22  |   page3IndicatorText: 'Page 3 of 50',
  23  |   lastPageIndicatorText: 'Page 50 of 50',
  24  |   nextLinkText: 'next',
  25  |   previousLinkText: 'previous',
  26  |   page1FirstBookTitle: 'A Light in the Attic',
  27  |   page2FirstBookTitle: 'In Her Wake',
  28  | };
  29  | 
  30  | class BookListPage {
  31  |   readonly page: Page;
  32  |   readonly heading: Locator;
  33  |   readonly nextLink: Locator;
  34  |   readonly previousLink: Locator;
  35  |   readonly currentPageIndicator: Locator;
  36  |   readonly productPods: Locator;
  37  | 
  38  |   constructor(page: Page) {
  39  |     this.page = page;
  40  |     this.heading = page.locator('.page-header h1');
  41  |     this.nextLink = page.locator('li.next a');
  42  |     this.previousLink = page.locator('li.previous a');
  43  |     this.currentPageIndicator = page.locator('.pager .current');
  44  |     this.productPods = page.locator('article.product_pod');
  45  |   }
  46  | 
  47  |   async goto(path: string) {
  48  |     return this.page.goto(path);
  49  |   }
  50  | 
  51  |   async clickNext() {
> 52  |     await this.nextLink.click();
      |                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  53  |   }
  54  | 
  55  |   async clickPrevious() {
  56  |     await this.previousLink.click();
  57  |   }
  58  | 
  59  |   firstProductTitle(): Locator {
  60  |     return this.productPods.first().locator('h3 a');
  61  |   }
  62  | }
  63  | 
  64  | test.describe('Books to Scrape — navigate to the next page of results', () => {
  65  |   // TC-001-P :: home page loads on page 1 with heading and 20 book listings [FR-01]
  66  |   test('TC-001-P: home page displays "All products" heading and page 1 of 50', async ({ page }) => {
  67  |     const list = new BookListPage(page);
  68  |     await list.goto(TEST_DATA.homePath);
  69  | 
  70  |     await expect(list.heading).toBeVisible();
  71  |     await expect(list.heading).toContainText(TEST_DATA.expectedPageHeading);
  72  |     await expect(list.currentPageIndicator).toContainText(TEST_DATA.page1IndicatorText);
  73  |     await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  74  |   });
  75  | 
  76  |   // TC-002-P :: next link is visible, enabled and correctly labelled on the first page [FR-02]
  77  |   test('TC-002-P: next link is visible and enabled on the first page', async ({ page }) => {
  78  |     const list = new BookListPage(page);
  79  |     await list.goto(TEST_DATA.homePath);
  80  | 
  81  |     await expect(list.nextLink).toBeVisible();
  82  |     await expect(list.nextLink).toBeEnabled();
  83  |     await expect(list.nextLink).toContainText(TEST_DATA.nextLinkText);
  84  |   });
  85  | 
  86  |   // TC-003-P :: clicking next navigates to page 2, updates the URL, pagination indicator and book list [FR-02]
  87  |   test('TC-003-P: clicking next navigates to page 2 with a new set of books', async ({ page }) => {
  88  |     const list = new BookListPage(page);
  89  |     await list.goto(TEST_DATA.homePath);
  90  | 
  91  |     await list.clickNext();
  92  | 
  93  |     await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Path.replace(/\//g, '\\/') + '$'));
  94  |     await expect(list.currentPageIndicator).toContainText(TEST_DATA.page2IndicatorText);
  95  |     await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  96  |     await expect(list.firstProductTitle()).toHaveAttribute('title', TEST_DATA.page2FirstBookTitle);
  97  |   });
  98  | 
  99  |   // TC-004-P :: previous link appears on page 2 and returns the user to page 1 [FR-03]
  100 |   test('TC-004-P: previous link appears on page 2 and navigates back to page 1', async ({ page }) => {
  101 |     const list = new BookListPage(page);
  102 |     await list.goto(TEST_DATA.page2Path);
  103 | 
  104 |     await expect(list.previousLink).toBeVisible();
  105 |     await expect(list.previousLink).toContainText(TEST_DATA.previousLinkText);
  106 | 
  107 |     await list.clickPrevious();
  108 | 
  109 |     await expect(page).toHaveURL(new RegExp(TEST_DATA.page1Path.replace(/\//g, '\\/') + '$'));
  110 |     await expect(list.currentPageIndicator).toContainText(TEST_DATA.page1IndicatorText);
  111 |   });
  112 | 
  113 |   // TC-005-P :: repeated next navigation advances sequentially through pages 1, 2 and 3 [FR-02]
  114 |   test('TC-005-P: repeated next clicks advance sequentially through pages 1, 2 and 3', async ({ page }) => {
  115 |     const list = new BookListPage(page);
  116 |     await list.goto(TEST_DATA.homePath);
  117 | 
  118 |     await list.clickNext();
  119 |     await expect(page).toHaveURL(new RegExp(TEST_DATA.page2Path.replace(/\//g, '\\/') + '$'));
  120 | 
  121 |     await list.clickNext();
  122 |     await expect(page).toHaveURL(new RegExp(TEST_DATA.page3Path.replace(/\//g, '\\/') + '$'));
  123 |     await expect(list.currentPageIndicator).toContainText(TEST_DATA.page3IndicatorText);
  124 |     await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  125 |   });
  126 | 
  127 |   // TC-006-F :: next link is absent on the final pagination page [FR-04]
  128 |   test('TC-006-F: next link is not present on the final page (page 50)', async ({ page }) => {
  129 |     const list = new BookListPage(page);
  130 |     await list.goto(TEST_DATA.lastPagePath);
  131 | 
  132 |     await expect(list.currentPageIndicator).toContainText(TEST_DATA.lastPageIndicatorText);
  133 |     await expect(list.productPods).toHaveCount(TEST_DATA.expectedProductsPerPage);
  134 |     await expect(list.nextLink).toHaveCount(0);
  135 |   });
  136 | 
  137 |   // TC-007-F :: previous link is absent on the first page [FR-03]
  138 |   test('TC-007-F: previous link is not present on the first page', async ({ page }) => {
  139 |     const list = new BookListPage(page);
  140 |     await list.goto(TEST_DATA.homePath);
  141 | 
  142 |     await expect(list.previousLink).toHaveCount(0);
  143 |   });
  144 | 
  145 |   // TC-008-F :: requesting a catalogue page number beyond the last page returns a 404 response [FR-04]
  146 |   test('TC-008-F: navigating directly to a page beyond the last page returns 404', async ({ page }) => {
  147 |     const list = new BookListPage(page);
  148 |     const response = await list.goto(TEST_DATA.nonexistentPagePath);
  149 | 
  150 |     expect(response?.status()).toBe(404);
  151 |   });
  152 | });
```