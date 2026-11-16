/**
 * Feature: httpbookstoscrapecom-navigate-to-the-nex
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 */
import { test, expect, Page } from '@playwright/test';

const TEST_DATA = {
  homeUrl: '/',
  page2Url: '/catalogue/page-2.html',
  page3Url: '/catalogue/page-3.html',
  page25Url: '/catalogue/page-25.html',
  page49Url: '/catalogue/page-49.html',
  page50Url: '/catalogue/page-50.html',
  page51Url: '/catalogue/page-51.html',
  page2Pattern: /page-2\.html/,
  page3Pattern: /page-3\.html/,
  page4Pattern: /page-4\.html/,
  page50Pattern: /page-50\.html/,
  pageIndicatorRegex: /^Page \d+ of \d+$/,
};

class CataloguePage {
  constructor(private page: Page) {}

  async navigate() {
    return this.page.goto(TEST_DATA.homeUrl);
  }

  async navigateTo(path: string) {
    return this.page.goto(path);
  }

  nextLink() {
    return this.page.locator('li.next > a');
  }

  nextListItem() {
    return this.page.locator('li.next');
  }

  previousLink() {
    return this.page.locator('li.previous > a');
  }

  pageIndicator() {
    return this.page.locator('li.current');
  }

  bookItems() {
    return this.page.locator('article.product_pod');
  }

  bookTitleLinks() {
    return this.page.locator('article.product_pod h3 > a');
  }

  async clickNext() {
    await this.nextLink().click();
    await this.page.waitForURL(/page-\d+/);
  }

  async getBookTitles(): Promise<(string | null)[]> {
    return this.bookTitleLinks().evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('title'))
    );
  }

  async getPageIndicatorText(): Promise<string> {
    const text = await this.pageIndicator().textContent();
    return (text ?? '').trim();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }
}

test.describe('httpbookstoscrapecom-navigate-to-the-nex', () => {
  let cataloguePage: CataloguePage;

  test.beforeEach(async ({ page }) => {
    cataloguePage = new CataloguePage(page);
  });

  // TC-001-P :: "Next" control visible on page 1 with a valid href  [FR-01]
  test('should show a visible "next" control with a non-empty href on page 1', async () => {
    await cataloguePage.navigate();
    await expect(cataloguePage.nextLink()).toBeVisible();
    const href = await cataloguePage.nextLink().getAttribute('href');
    expect(href).toBeTruthy();
  });

  // TC-002-F :: "Next" control is not falsely hidden on a mid-catalogue page  [FR-01]
  test('should not have the "next" control hidden via display or visibility on page 25', async () => {
    await cataloguePage.navigateTo(TEST_DATA.page25Url);
    await expect(cataloguePage.nextLink()).toBeVisible();
  });

  // TC-003-P :: Clicking "Next" from page 1 navigates to page 2  [FR-02]
  test('should navigate to page 2 when "next" is clicked from page 1', async ({ page }) => {
    await cataloguePage.navigate();
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page2Pattern);
  });

  // TC-004-F :: Clicking "Next" does not leave the URL unchanged  [FR-02]
  test('should change the URL away from page 1 when "next" is clicked', async ({ page }) => {
    await cataloguePage.navigate();
    const urlBefore = page.url();
    await cataloguePage.clickNext();
    const urlAfter = page.url();
    expect(urlAfter).not.toBe(urlBefore);
    expect(urlAfter).toMatch(TEST_DATA.page2Pattern);
  });

  // TC-005-P :: Page 2 displays a completely distinct book set from page 1  [FR-03]
  test('should render a page 2 book set with no titles from page 1', async () => {
    await cataloguePage.navigate();
    const page1Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    const page2Titles = await cataloguePage.getBookTitles();
    for (const title of page2Titles) {
      expect(page1Titles).not.toContain(title);
    }
  });

  // TC-006-F :: Page 2 is not a duplicate or empty render of page 1  [FR-03]
  test('should not render page 2 as identical to or empty compared with page 1', async () => {
    await cataloguePage.navigate();
    const page1Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    const page2Titles = await cataloguePage.getBookTitles();
    expect(page2Titles.length).toBeGreaterThan(0);
    expect(page2Titles).not.toEqual(page1Titles);
  });

  // TC-007-P :: Sequential "Next" clicks advance page 1 -> 2 -> 3 with distinct book sets  [FR-04]
  test('should advance from page 1 to page 3 via two "next" clicks with a distinct page 3 set', async ({ page }) => {
    await cataloguePage.navigate();
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page2Pattern);
    const page2Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page3Pattern);
    const page3Titles = await cataloguePage.getBookTitles();
    for (const title of page3Titles) {
      expect(page2Titles).not.toContain(title);
    }
  });

  // TC-008-F :: Repeated "Next" navigation does not repeat a previously visited page URL  [FR-04]
  test('should visit three distinct URLs across three consecutive "next" clicks', async ({ page }) => {
    await cataloguePage.navigate();
    const visited: string[] = [];
    for (let i = 0; i < 3; i++) {
      await cataloguePage.clickNext();
      visited.push(page.url());
    }
    expect(new Set(visited).size).toBe(3);
  });

  // TC-009-P :: "Next" control is absent on the last page (page 50)  [FR-05]
  test('should have zero "next" list items on page 50', async () => {
    await cataloguePage.navigateTo(TEST_DATA.page50Url);
    await expect(cataloguePage.nextListItem()).toHaveCount(0);
  });

  // TC-010-F :: "Previous" control remains present on the last page despite "Next" being absent  [FR-05]
  test('should still show a visible "previous" control on page 50', async () => {
    await cataloguePage.navigateTo(TEST_DATA.page50Url);
    await expect(cataloguePage.nextListItem()).toHaveCount(0);
    await expect(cataloguePage.previousLink()).toBeVisible();
  });

  // TC-011-P :: Page indicator reads "Page 2 of 50" after one "Next" click  [FR-06]
  test('should show "Page 2 of 50" in the page indicator after one "next" click', async () => {
    await cataloguePage.navigate();
    await cataloguePage.clickNext();
    const indicatorText = await cataloguePage.getPageIndicatorText();
    expect(indicatorText).toBe('Page 2 of 50');
  });

  // TC-012-F :: Page indicator does not retain the stale "Page 1 of 50" value after navigating  [FR-06]
  test('should not retain "Page 1 of 50" in the indicator after navigating to page 2', async () => {
    await cataloguePage.navigate();
    const indicatorBefore = await cataloguePage.getPageIndicatorText();
    expect(indicatorBefore).toBe('Page 1 of 50');
    await cataloguePage.clickNext();
    const indicatorAfter = await cataloguePage.getPageIndicatorText();
    expect(indicatorAfter).not.toBe('Page 1 of 50');
    expect(indicatorAfter).toMatch(TEST_DATA.pageIndicatorRegex);
  });

  // TC-013-P :: Direct navigation beyond the last page returns a 404, not a blank grid  [FR-07]
  test('should return a 404 response with no book items when navigating directly to page 51', async () => {
    const response = await cataloguePage.navigateTo(TEST_DATA.page51Url);
    expect(response?.status()).toBe(404);
    await expect(cataloguePage.bookItems()).toHaveCount(0);
  });

  // TC-014-F :: Page 51 does not silently duplicate page 50's book content  [FR-07]
  test('should not render page 50\'s book set on page 51', async () => {
    await cataloguePage.navigateTo(TEST_DATA.page50Url);
    const page50Titles = await cataloguePage.getBookTitles();
    expect(page50Titles.length).toBeGreaterThan(0);
    await cataloguePage.navigateTo(TEST_DATA.page51Url);
    await expect(cataloguePage.bookItems()).toHaveCount(0);
  });

  // TC-015-P :: Browser back after using "Next" restores page 1's URL and book set  [FR-08]
  test('should restore page 1\'s URL and book set after browser back from page 2', async ({ page }) => {
    await cataloguePage.navigate();
    const page1Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page2Pattern);
    await cataloguePage.goBack();
    await expect(page).not.toHaveURL(TEST_DATA.page2Pattern);
    const restoredTitles = await cataloguePage.getBookTitles();
    expect(restoredTitles).toEqual(page1Titles);
  });

  // TC-016-F :: "Next" control is available again after navigating back to page 1  [FR-08]
  test('should show the "next" control again after navigating back to page 1', async ({ page }) => {
    await cataloguePage.navigate();
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page2Pattern);
    await cataloguePage.goBack();
    await expect(cataloguePage.nextLink()).toBeVisible();
  });

  // TC-017-F :: "Next" disappears exactly at page 50, not one page early  [FR-05]
  test('should have "next" present on page 49 but absent on page 50', async () => {
    await cataloguePage.navigateTo(TEST_DATA.page49Url);
    await expect(cataloguePage.nextLink()).toBeVisible();
    await cataloguePage.navigateTo(TEST_DATA.page50Url);
    await expect(cataloguePage.nextListItem()).toHaveCount(0);
  });

  // TC-018-P :: Navigating "Next" from page 49 to page 50 succeeds without error  [FR-04]
  test('should navigate from page 49 to page 50 with book items rendered', async ({ page }) => {
    await cataloguePage.navigateTo(TEST_DATA.page49Url);
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page50Pattern);
    await expect(cataloguePage.bookItems().first()).toBeVisible();
  });

  // TC-019-P :: Back then forward restores page 2 state  [FR-08]
  test('should restore page 2\'s URL and book set after back then forward navigation', async ({ page }) => {
    await cataloguePage.navigate();
    await cataloguePage.clickNext();
    await expect(page).toHaveURL(TEST_DATA.page2Pattern);
    const page2Titles = await cataloguePage.getBookTitles();

    await cataloguePage.goBack();
    await expect(page).not.toHaveURL(TEST_DATA.page2Pattern);

    await cataloguePage.goForward();
    await expect(page).toHaveURL(TEST_DATA.page2Pattern);
    const restoredTitles = await cataloguePage.getBookTitles();
    expect(restoredTitles).toEqual(page2Titles);
  });

  // TC-020-P :: Page indicator is well-formed at the last-page boundary  [FR-06]
  test('should show "Page 50 of 50" in the page indicator on page 50', async () => {
    await cataloguePage.navigateTo(TEST_DATA.page50Url);
    const indicatorText = await cataloguePage.getPageIndicatorText();
    expect(indicatorText).toMatch(TEST_DATA.pageIndicatorRegex);
    expect(indicatorText).toBe('Page 50 of 50');
  });
});
