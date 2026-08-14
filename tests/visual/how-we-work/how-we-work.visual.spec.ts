import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/tests/visual/fixtures/how-we-work/index.html';
const EVIDENCE_DIR = resolve('tests/visual/how-we-work/evidence');
const BODY = '.how-we-work-body';

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

test('method corridor supports keyboard focus and activation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await openFixture(page);
  const first = page.locator('[data-method-stage="discovery"]');
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-method-stage="fit"]')).toBeFocused();
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'fit');
  await page.keyboard.press('End');
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
