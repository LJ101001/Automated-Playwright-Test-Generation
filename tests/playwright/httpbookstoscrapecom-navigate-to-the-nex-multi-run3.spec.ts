/**
 * Feature: httpbookstoscrapecom-navigate-to-the-nex
 * Agent: Tester (multi-agent pipeline)
 * Dissertation: Lewis Watson, 40619754
 * Evaluation metrics: success rate, FR coverage, fault detection
 */
import { test, expect, Page, Response } from '@playwright/test';

const TEST_DATA = {
  page1Path: '/',
  page2Path: '/catalogue/page-2.html',
  page49Path: '/catalogue/page-49.html',
  page50Path: '/catalogue/page-50.html',
  page51Path: '/catalogue/page-51.html',
  pageIndicatorRegex: /^Page \d+ of \d+$/,
  navigationUrlRegex: /\/catalogue\/page-\d+\.html/,
};

class BookCataloguePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto(TEST_DATA.page1Path);
  }

  async gotoPath(path: string): Promise<Response | null> {
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
    await Promise.all([
      this.page.waitForURL(TEST_DATA.navigationUrlRegex),
      this.nextLink().click(),
    ]);
  }

  async rapidDoubleClickNext() {
    await this.page.evaluate(() => {
      const link = document.querySelector('li.next > a') as HTMLAnchorElement | null;
      link?.click();
      link?.click();
    });
    // The duplicate click races/aborts the in-flight navigation from the first click,
    // so the settled state can be either page 1 (unchanged) or page 2 (single hop) —
    // never page 3. Swallow the resulting navigation noise and just wait for settle.
    await this.page.waitForLoadState('load').catch(() => {});
  }

  async getBookTitles(): Promise<string[]> {
    return this.bookTitleLinks().evaluateAll((links) =>
      links.map((el) => el.getAttribute('title') ?? '')
    );
  }

  async getPageIndicatorText(): Promise<string> {
    const raw = await this.pageIndicator().textContent();
    return (raw ?? '').trim();
  }

  async goBack() {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.page.goBack(),
    ]);
  }

  async goForward() {
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.page.goForward(),
    ]);
  }
}

test.describe('httpbookstoscrapecom-navigate-to-the-nex', () => {
  let cataloguePage: BookCataloguePage;

  test.beforeEach(async ({ page }) => {
    cataloguePage = new BookCataloguePage(page);
    await cataloguePage.navigate();
  });

  // TC-001-P :: "Next" Control Visible on Page 1  [FR-01]
  test('should show a visible "next" control with a non-empty href on page 1', async () => {
    await expect(cataloguePage.nextLink()).toBeVisible();
    const href = await cataloguePage.nextLink().getAttribute('href');
    expect(href).toBeTruthy();
  });

  // TC-002-P :: "Next" Control Still Visible on Page 49 (Boundary)  [FR-01]
  test('should show a visible "next" control on page 49', async () => {
    await cataloguePage.gotoPath(TEST_DATA.page49Path);
    await expect(cataloguePage.nextLink()).toBeVisible();
  });

  // TC-003-F :: "Next" Control Not Falsely Hidden on a Valid Page  [FR-01]
  test('should not render the "next" control as hidden on page 1', async () => {
    await expect(cataloguePage.nextListItem()).toHaveCount(1);
    await expect(cataloguePage.nextLink()).toBeVisible();
  });

  // TC-004-P :: Clicking "Next" from Page 1 Navigates to Page 2  [FR-02]
  test('should navigate to page 2 when "next" is clicked from page 1', async ({ page }) => {
    await cataloguePage.clickNext();
    expect(page.url()).toContain('page-2');
  });

  // TC-005-F :: Clicking "Next" Does Not Leave URL Unchanged  [FR-02]
  test('should change the URL after clicking "next"', async ({ page }) => {
    const urlBefore = page.url();
    await cataloguePage.clickNext();
    const urlAfter = page.url();
    expect(urlAfter).not.toBe(urlBefore);
    expect(urlAfter).toContain('page-2');
  });

  // TC-006-F :: Rapid Double-Click on "Next" Does Not Skip to Page 3  [FR-02]
  test('should not skip to page 3 after a rapid double-click on "next"', async ({ page }) => {
    await cataloguePage.rapidDoubleClickNext();
    expect(page.url()).not.toContain('page-3');
  });

  // TC-007-P :: New Book Set Displayed After Navigating to Page 2  [FR-03]
  test('should display a completely distinct book set on page 2 compared with page 1', async () => {
    const page1Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    const page2Titles = await cataloguePage.getBookTitles();
    const overlap = page2Titles.filter((title) => page1Titles.includes(title));
    expect(overlap).toHaveLength(0);
  });

  // TC-008-F :: Page 2 Is Not a Duplicate or Empty Render of Page 1  [FR-03]
  test('should not render page 2 as an empty or identical copy of page 1', async () => {
    const page1Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    const page2Titles = await cataloguePage.getBookTitles();
    expect(page2Titles.length).toBeGreaterThan(0);
    expect(page2Titles).not.toEqual(page1Titles);
  });

  // TC-009-P :: Page 2 Book Count Is Within Expected Bounds  [FR-03]
  test('should render between 1 and 20 book items on page 2', async () => {
    await cataloguePage.clickNext();
    const count = await cataloguePage.bookItems().count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(20);
  });

  // TC-010-P :: Clicking "Next" Twice Advances Page 1 -> 2 -> 3  [FR-04]
  test('should advance sequentially to page 3 with a further distinct book set', async ({ page }) => {
    await cataloguePage.clickNext();
    expect(page.url()).toContain('page-2');
    const page2Titles = await cataloguePage.getBookTitles();

    await cataloguePage.clickNext();
    expect(page.url()).toContain('page-3');
    const page3Titles = await cataloguePage.getBookTitles();

    const overlap = page3Titles.filter((title) => page2Titles.includes(title));
    expect(overlap).toHaveLength(0);
  });

  // TC-011-F :: Repeated Navigation Does Not Repeat a Previously Seen Page  [FR-04]
  test('should not revisit a previously seen page across three consecutive "next" clicks', async ({ page }) => {
    const visitedUrls: string[] = [];
    for (let i = 0; i < 3; i++) {
      await cataloguePage.clickNext();
      visitedUrls.push(page.url());
    }
    expect(new Set(visitedUrls).size).toBe(visitedUrls.length);
    expect(visitedUrls[0]).toContain('page-2');
    expect(visitedUrls[1]).toContain('page-3');
    expect(visitedUrls[2]).toContain('page-4');
  });

  // TC-012-P :: Navigating "Next" from Page 49 to the Last Page Does Not Error  [FR-04]
  test('should reach page 50 without error when clicking "next" from page 49', async ({ page }) => {
    await cataloguePage.gotoPath(TEST_DATA.page49Path);
    await cataloguePage.clickNext();
    expect(page.url()).toContain('page-50');
    const count = await cataloguePage.bookItems().count();
    expect(count).toBeGreaterThan(0);
  });

  // TC-013-P :: "Next" Control Absent on the Last Page  [FR-05]
  test('should not render a "next" control on page 50', async () => {
    await cataloguePage.gotoPath(TEST_DATA.page50Path);
    await expect(cataloguePage.nextListItem()).toHaveCount(0);
  });

  // TC-014-F :: "Previous" Control Still Present on the Last Page  [FR-05]
  test('should still show a visible "previous" control on page 50', async () => {
    await cataloguePage.gotoPath(TEST_DATA.page50Path);
    await expect(cataloguePage.previousLink()).toBeVisible();
  });

  // TC-015-P :: Page 50 Is the True Boundary -- Page 49 Still Has "Next"  [FR-05]
  test('should show "next" on page 49 but not on page 50', async () => {
    await cataloguePage.gotoPath(TEST_DATA.page49Path);
    await expect(cataloguePage.nextLink()).toBeVisible();

    await cataloguePage.gotoPath(TEST_DATA.page50Path);
    await expect(cataloguePage.nextListItem()).toHaveCount(0);
  });

  // TC-016-P :: Page Indicator Shows "Page 2 of 50" After One "Next" Click  [FR-06]
  test('should show "Page 2 of 50" in the page indicator after one "next" click', async () => {
    await cataloguePage.clickNext();
    const indicatorText = await cataloguePage.getPageIndicatorText();
    expect(indicatorText).toBe('Page 2 of 50');
  });

  // TC-017-F :: Page Indicator Does Not Show Stale Page Number  [FR-06]
  test('should not retain the page 1 indicator text after navigating to page 2', async () => {
    const indicatorBefore = await cataloguePage.getPageIndicatorText();
    await cataloguePage.clickNext();
    const indicatorAfter = await cataloguePage.getPageIndicatorText();
    expect(indicatorAfter).not.toBe(indicatorBefore);
    expect(indicatorAfter).not.toBe('Page 1 of 50');
  });

  // TC-018-P :: Page Indicator Format Is Well-Formed at a Boundary Page  [FR-06]
  test('should show a well-formed "Page 50 of 50" indicator on the last page', async () => {
    await cataloguePage.gotoPath(TEST_DATA.page50Path);
    const indicatorText = await cataloguePage.getPageIndicatorText();
    expect(indicatorText).toMatch(TEST_DATA.pageIndicatorRegex);
    expect(indicatorText).toBe('Page 50 of 50');
  });

  // TC-019-P :: Direct Navigation Beyond Last Page Does Not Show a Blank Grid  [FR-07]
  test('should return a 404 with no catalogue grid when navigating beyond the last page', async () => {
    const response = await cataloguePage.gotoPath(TEST_DATA.page51Path);
    expect(response?.status()).toBe(404);
    await expect(cataloguePage.bookItems()).toHaveCount(0);
  });

  // TC-020-F :: Page Beyond Last Does Not Duplicate Page 50's Content  [FR-07]
  test('should not re-serve page 50\'s book set on the beyond-last-page URL', async () => {
    await cataloguePage.gotoPath(TEST_DATA.page50Path);
    const page50Titles = await cataloguePage.getBookTitles();
    expect(page50Titles.length).toBeGreaterThan(0);

    await cataloguePage.gotoPath(TEST_DATA.page51Path);
    await expect(cataloguePage.bookItems()).toHaveCount(0);
  });

  // TC-021-P :: Navigating Just One Page Past the Last Is the True Failure Boundary  [FR-07]
  test('should treat page 50 as valid and page 51 as the exact failure boundary', async () => {
    const page50Response = await cataloguePage.gotoPath(TEST_DATA.page50Path);
    expect(page50Response?.status()).toBe(200);
    await expect(cataloguePage.bookItems().first()).toBeVisible();

    const page51Response = await cataloguePage.gotoPath(TEST_DATA.page51Path);
    expect(page51Response?.status()).toBe(404);
  });

  // TC-022-P :: Browser Back Returns to Page 1 After Using "Next"  [FR-08]
  test('should restore page 1\'s URL and book set after browser back navigation', async ({ page }) => {
    const page1Titles = await cataloguePage.getBookTitles();
    await cataloguePage.clickNext();
    expect(page.url()).toContain('page-2');

    await cataloguePage.goBack();
    expect(page.url()).not.toContain('page-2');
    const restoredTitles = await cataloguePage.getBookTitles();
    expect(restoredTitles).toEqual(page1Titles);
  });

  // TC-023-F :: "Next" Control Is Available Again After Navigating Back  [FR-08]
  test('should show the "next" control again after navigating back to page 1', async () => {
    await cataloguePage.clickNext();
    await cataloguePage.goBack();
    await expect(cataloguePage.nextLink()).toBeVisible();
  });

  // TC-024-P :: Back Then Forward Restores Page 2 State  [FR-08]
  test('should restore page 2\'s URL and book set after back then forward navigation', async ({ page }) => {
    await cataloguePage.clickNext();
    const page2Titles = await cataloguePage.getBookTitles();

    await cataloguePage.goBack();
    await cataloguePage.goForward();

    expect(page.url()).toContain('page-2');
    const restoredTitles = await cataloguePage.getBookTitles();
    expect(restoredTitles).toEqual(page2Titles);
  });
});
