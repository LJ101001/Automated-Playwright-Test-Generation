/**
 * Feature: httpbookstoscrapecom-filter-books-by-the
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  crimeCategoryUrl: '/catalogue/category/books/crime_51/index.html',
  mysteryUrl: '/catalogue/category/books/mystery_3/index.html',
  mysteryPage2Url: '/catalogue/category/books/mystery_3/page-2.html',
  mysteryUrlPattern: /\/catalogue\/category\/books\/mystery_3\//,
  categoryName: 'Mystery',
  distractorCategories: ['Crime', 'Thriller'],
  malformedHeadings: ['Mystery Books', ' Mystery ', 'Crime', 'Thriller'],
  firstListingTitle: 'Sharp Objects',
  secondListingTitle: 'In a Dark, Dark Wood',
  expectedTotalResults: 32,
  expectedPage1Count: 20,
  priceRegex: /^£\d+\.\d{2}$/,
  emptyResultsFixture: `<!DOCTYPE html><html><head><title>Mystery</title></head><body>
    <div class="page-header action"><h1>Mystery</h1></div>
    <form method="get" class="form-horizontal"><strong>0</strong> results</form>
    <ol class="row"></ol>
  </body></html>`,
};

class MysteryCategoryPage {
  constructor(private page: Page) {}

  async navigate() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async navigateTo(path: string) {
    return this.page.goto(path);
  }

  sidebarMysteryLink() {
    return this.page
      .locator('.side_categories ul.nav-list li ul li a')
      .filter({ hasText: /^\s*Mystery\s*$/ });
  }

  async clickSidebarMysteryLink() {
    await this.sidebarMysteryLink().click();
  }

  heading() {
    return this.page.locator('.page-header.action h1');
  }

  resultsCount() {
    return this.page.locator('.form-horizontal strong').first();
  }

  bookItems() {
    return this.page.locator('ol.row li article.product_pod');
  }

  bookTitleLinks() {
    return this.page.locator('article.product_pod h3 a');
  }

  nextLink() {
    return this.page.locator('.pager .next a');
  }

  async clickNextLink() {
    await this.nextLink().click();
  }

  async clickNthBookTitle(index: number) {
    await this.bookTitleLinks().nth(index).click();
  }

  productHeading() {
    return this.page.locator('.product_main h1');
  }

  breadcrumbCategory() {
    return this.page.locator('.breadcrumb li:nth-child(3) a');
  }
}

test.describe('httpbookstoscrapecom-filter-books-by-the', () => {
  let categoryPage: MysteryCategoryPage;

  test.beforeEach(async ({ page }) => {
    categoryPage = new MysteryCategoryPage(page);
  });

  // TC-001-P :: Navigate to Mystery category from homepage sidebar  [FR-01]
  test('should navigate to the Mystery category page when the sidebar link is clicked', async ({ page }) => {
    await categoryPage.navigate();
    await categoryPage.clickSidebarMysteryLink();
    await expect(page).toHaveURL(TEST_DATA.mysteryUrlPattern);
  });

  // TC-002-F :: Category link is exact match, not conflated with adjacent categories  [FR-01]
  test('should have exactly one exact-text "Mystery" sidebar link that resolves to the correct category', async ({ page }) => {
    await categoryPage.navigate();
    await expect(categoryPage.sidebarMysteryLink()).toHaveCount(1);
    await categoryPage.clickSidebarMysteryLink();
    const headingText = (await categoryPage.heading().textContent())?.trim();
    expect(headingText).toBe(TEST_DATA.categoryName);
    expect(TEST_DATA.distractorCategories).not.toContain(headingText);
  });

  // TC-003-P :: Category sidebar filter reachable from a non-homepage page  [FR-01]
  test('should reach the Mystery category page from a non-homepage page that renders the sidebar', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.crimeCategoryUrl);
    await categoryPage.clickSidebarMysteryLink();
    await expect(page).toHaveURL(TEST_DATA.mysteryUrlPattern);
  });

  // TC-004-P :: Mystery category page heading identifies the category  [FR-02]
  test('should display a heading equal to "Mystery" on the category page', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    await expect(categoryPage.heading()).toHaveText(TEST_DATA.categoryName);
  });

  // TC-005-F :: Heading is an exact match only, never padded or conflated with another category  [FR-02]
  test('should not display a heading conflated with another category or padded with extra text', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const headingText = await categoryPage.heading().textContent();
    for (const malformed of TEST_DATA.malformedHeadings) {
      expect(headingText).not.toBe(malformed);
    }
    expect(headingText?.trim()).toBe(TEST_DATA.categoryName);
  });

  // TC-006-P :: All displayed books belong to the Mystery category  [FR-03]
  test('should confirm the first listing belongs to Mystery via its own product-page breadcrumb', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    await categoryPage.clickNthBookTitle(0);
    await expect(categoryPage.breadcrumbCategory()).toHaveText(TEST_DATA.categoryName);
  });

  // TC-007-F :: Mystery category with zero results does not error  [FR-03]
  test('should render without error when the category returns zero results', async ({ page }) => {
    await page.route(`**${TEST_DATA.mysteryUrl}`, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: TEST_DATA.emptyResultsFixture })
    );
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    await expect(categoryPage.heading()).toHaveText(TEST_DATA.categoryName);
    await expect(categoryPage.bookItems()).toHaveCount(0);
  });

  // TC-008-F :: Filter persists across pagination to the last page  [FR-03]
  test('should keep the Mystery filter and heading intact when paginating to the next page', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    await categoryPage.clickNextLink();
    await expect(page).toHaveURL(TEST_DATA.mysteryUrlPattern);
    await expect(categoryPage.heading()).toHaveText(TEST_DATA.categoryName);
    await expect(categoryPage.nextLink()).toHaveCount(0);
  });

  // TC-009-P :: Displayed result count matches the actual number of books shown  [FR-04]
  test('should show a total result count equal to the sum of listings across both pages', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const totalText = await categoryPage.resultsCount().textContent();
    const total = Number(totalText?.trim());
    const page1Count = await categoryPage.bookItems().count();

    await categoryPage.navigateTo(TEST_DATA.mysteryPage2Url);
    const page2Count = await categoryPage.bookItems().count();

    expect(total).toBe(TEST_DATA.expectedTotalResults);
    expect(page1Count + page2Count).toBe(total);
  });

  // TC-010-F :: Final-page item count reconciles with the total and pagination correctly ends  [FR-04]
  test('should show a final-page item count matching the remainder of the total, with no further pagination', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const totalText = await categoryPage.resultsCount().textContent();
    const total = Number(totalText?.trim());
    const page1Count = await categoryPage.bookItems().count();
    expect(page1Count).toBe(TEST_DATA.expectedPage1Count);

    await categoryPage.navigateTo(TEST_DATA.mysteryPage2Url);
    const page2Count = await categoryPage.bookItems().count();

    expect(page2Count).toBe(total - page1Count);
    await expect(categoryPage.nextLink()).toHaveCount(0);
  });

  // TC-011-P :: Each book listing shows title, price, and availability  [FR-05]
  test('should show a non-empty title, formatted price, and in-stock availability on the first listing', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const firstItem = categoryPage.bookItems().first();
    await expect(firstItem.locator('h3 a')).not.toHaveText('');
    await expect(firstItem.locator('.price_color')).toHaveText(TEST_DATA.priceRegex);
    await expect(firstItem.locator('.instock.availability')).toContainText('In stock');
  });

  // TC-012-F :: No listing has an empty title, malformed price, or missing availability text  [FR-05]
  test('should not have any listing with an empty title, malformed price, or missing availability text', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const items = categoryPage.bookItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const title = await item.locator('h3 a').getAttribute('title');
      expect(title?.trim()).not.toBe('');

      const priceText = (await item.locator('.price_color').textContent())?.trim();
      expect(priceText).toMatch(TEST_DATA.priceRegex);

      const availabilityText = await item.locator('.instock.availability').textContent();
      expect(availabilityText).toContain('In stock');
    }
  });

  // TC-013-P :: Clicking a book title from filtered results opens the matching product detail page  [FR-06]
  test('should open a product detail page whose heading matches the clicked listing title', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const recordedTitle = await categoryPage.bookTitleLinks().first().getAttribute('title');
    expect(recordedTitle).toBe(TEST_DATA.firstListingTitle);
    await categoryPage.clickNthBookTitle(0);
    await expect(categoryPage.productHeading()).toHaveText(recordedTitle ?? '');
  });

  // TC-014-F :: Product detail navigation does not leak to an unrelated product  [FR-06]
  test('should not navigate to the second listing product page when the first listing is clicked', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const firstTitle = await categoryPage.bookTitleLinks().nth(0).getAttribute('title');
    const secondTitle = await categoryPage.bookTitleLinks().nth(1).getAttribute('title');
    expect(secondTitle).toBe(TEST_DATA.secondListingTitle);
    await categoryPage.clickNthBookTitle(0);
    const resultHeading = await categoryPage.productHeading().textContent();
    expect(resultHeading).toBe(firstTitle);
    expect(resultHeading).not.toBe(secondTitle);
  });

  // TC-015-P :: Direct URL navigation to the Mystery category page renders correctly  [FR-07]
  test('should render the correct heading and item count when navigating directly to the Mystery URL', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    await expect(categoryPage.heading()).toHaveText(TEST_DATA.categoryName);
    await expect(categoryPage.bookItems().first()).toBeVisible();
    const totalText = await categoryPage.resultsCount().textContent();
    expect(Number(totalText?.trim())).toBeGreaterThan(0);
  });

  // TC-016-F :: Repeated activation of the Mystery filter is idempotent  [FR-07]
  test('should stay on the same Mystery page with an unchanged item count after repeated filter clicks', async ({ page }) => {
    await categoryPage.navigateTo(TEST_DATA.mysteryUrl);
    const initialCount = await categoryPage.bookItems().count();

    await categoryPage.clickSidebarMysteryLink();
    await expect(page).toHaveURL(TEST_DATA.mysteryUrlPattern);
    await expect(categoryPage.heading()).toHaveText(TEST_DATA.categoryName);
    await expect(categoryPage.bookItems()).toHaveCount(initialCount);

    await categoryPage.clickSidebarMysteryLink();
    await expect(page).toHaveURL(TEST_DATA.mysteryUrlPattern);
    await expect(categoryPage.heading()).toHaveText(TEST_DATA.categoryName);
    await expect(categoryPage.bookItems()).toHaveCount(initialCount);
  });
});
