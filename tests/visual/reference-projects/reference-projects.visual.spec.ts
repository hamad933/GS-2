import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/tests/visual/fixtures/reference-projects/index.html';
const EVIDENCE_DIR = resolve('tests/visual/reference-projects/evidence');
const BODY = '.reference-projects-body';

async function openFixture(page: Page, locale: 'ar' | 'en' = 'ar') {
  await page.goto(`${FIXTURE}?locale=${locale}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp01');
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

test('all four references support pointer focus and contextual expansion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);

  for (const projectId of ['rp01', 'rp02', 'rp03', 'rp04']) {
    await page.locator(`[data-project-selector="${projectId}"]`).click();
    await expect(page.locator(BODY)).toHaveAttribute('data-active-project', projectId);
  }

  const toggle = page.getByRole('button', { name: /سجل الحدود والتحقق/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.rp-ledger')).toHaveClass(/is-open/);
  await expect(page.getByText('ROUTE_NOT_CONFIGURED').first()).toBeVisible();
});

test('reference selector supports keyboard focus and activation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await openFixture(page);
  const first = page.locator('[data-project-selector="rp01"]');
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-project-selector="rp02"]')).toBeFocused();
  await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp02');
  await page.keyboard.press('End');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp04');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`reference body has no overflow or runtime errors at ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-project-selector="rp04"]').click();
    await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
    await expectNoHorizontalOverflow(page);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
}

test('reference body preserves Arabic RTL and English LTR', async ({ page }) => {
  await openFixture(page, 'ar');
  await expect(page.locator(BODY)).toHaveAttribute('dir', 'rtl');
  await openFixture(page, 'en');
  await expect(page.locator(BODY)).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: /Four operating environments/ })).toBeVisible();
});

test('captures required reference body evidence', async ({ page }) => {
  test.slow();
  for (const width of [1440, 1024, 768, 430, 390]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-project-selector="rp02"]').click();
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `reference-projects-${width}-rp02.png`), fullPage: true, animations: 'disabled' });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  await page.locator('[data-project-selector="rp04"]').click();
  await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
  await page.locator('.rp-ledger').screenshot({ path: resolve(EVIDENCE_DIR, 'reference-projects-1440-rp04-ledger.png'), animations: 'disabled' });
});
