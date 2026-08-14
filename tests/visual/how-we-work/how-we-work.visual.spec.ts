import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/tests/visual/fixtures/how-we-work/index.html';
const EVIDENCE_DIR = resolve('tests/visual/how-we-work/evidence');
const BODY = '.how-we-work-body';
const STAGE_SELECTOR = '.method-stage-selector';

async function openFixture(page: Page, locale: 'ar' | 'en' = 'ar') {
  await page.goto(`${FIXTURE}?locale=${locale}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'discovery');
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test.beforeAll(async () => {
  await mkdir(EVIDENCE_DIR, { recursive: true });
});

test('all seven method gates support pointer progression', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  for (const stageId of ['discovery', 'fit', 'scope', 'risk', 'build', 'quality', 'transition']) {
    await page.locator(`[data-method-stage="${stageId}"]`).click();
    await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', stageId);
  }
  await expect(page.getByRole('heading', { name: 'من القرار إلى المشروع' })).toBeVisible();
});

test('method tablist orientation follows responsive layout and viewport changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  const tablist = page.locator(STAGE_SELECTOR);
  await expect(tablist).toHaveAttribute('aria-orientation', 'vertical');

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

  const discovery = page.locator('[data-method-stage="discovery"]');
  const fit = page.locator('[data-method-stage="fit"]');
  await discovery.focus();
  await page.keyboard.press('ArrowRight');
  await expect(fit).toBeFocused();
  await expect(fit).toHaveAttribute('aria-selected', 'true');
  await expect(discovery).toHaveAttribute('aria-selected', 'false');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
});

test('method corridor preserves selected semantics and keyboard stage selection', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await openFixture(page);
  const first = page.locator('[data-method-stage="discovery"]');
  const fit = page.locator('[data-method-stage="fit"]');
  const panel = page.getByRole('tabpanel');

  await first.focus();
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS('outline-style', 'solid');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(fit).toHaveAttribute('aria-selected', 'false');

  await page.keyboard.press('ArrowDown');
  await expect(fit).toBeFocused();
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'fit');
  await expect(first).toHaveAttribute('aria-selected', 'false');
  await expect(fit).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toHaveAttribute('aria-labelledby', await fit.getAttribute('id') ?? '');

  await page.keyboard.press('End');
  const transition = page.locator('[data-method-stage="transition"]');
  await expect(transition).toBeFocused();
  await expect(transition).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'transition');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`method body has no overflow or runtime errors at ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-method-stage="risk"]').click();
    await page.locator('[data-method-stage="quality"]').click();
    await expectNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test('method body preserves Arabic RTL and English LTR', async ({ page }) => {
  await openFixture(page, 'ar');
  await expect(page.locator(BODY)).toHaveAttribute('dir', 'rtl');
  await openFixture(page, 'en');
  await expect(page.locator(BODY)).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: /From an incomplete need/ })).toBeVisible();
});

test('captures required method body evidence', async ({ page }) => {
  test.slow();
  for (const width of [1440, 1024, 768, 430, 390]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-method-stage="scope"]').click();
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `how-we-work-${width}-scope.png`), fullPage: true, animations: 'disabled' });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page, 'en');
  await page.locator('[data-method-stage="quality"]').click();
  await page.locator('.method-corridor').screenshot({ path: resolve(EVIDENCE_DIR, 'how-we-work-1440-ltr-quality.png'), animations: 'disabled' });
});
