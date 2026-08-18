import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';

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

async function expectFontAtLeast(locator: Locator, minimumPx: number) {
  const fontSize = await locator.evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(minimumPx);
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
  await expect(page.getByText('المسار الخارجي الموثوق غير متاح حاليًا').first()).toBeVisible();
  await expect(page.getByText('ROUTE_NOT_CONFIGURED')).toHaveCount(0);
});

test('desktop selector exposes vertical semantics and vertical keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await openFixture(page);

  const selector = page.getByRole('tablist', { name: 'اختر المشروع المرجعي' });
  await expect(selector).toHaveAttribute('aria-orientation', 'vertical');

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

for (const width of [768, 430, 390]) {
  test(`responsive selector exposes horizontal semantics and RTL horizontal keyboard navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);

    const selector = page.getByRole('tablist', { name: 'اختر المشروع المرجعي' });
    await expect(selector).toHaveAttribute('aria-orientation', 'horizontal');

    const first = page.locator('[data-project-selector="rp01"]');
    await first.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-project-selector="rp02"]')).toBeFocused();
    await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp02');
    await page.keyboard.press('ArrowRight');
    await expect(first).toBeFocused();
    await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp01');
  });
}

test('public RP display notation is buyer-facing while internal selector ids remain canonical', async ({ page }) => {
  await openFixture(page);

  const selectorCodes = await page.locator('.rp-project-selector__code').allTextContents();
  expect(selectorCodes).toEqual(['RP-01', 'RP-02', 'RP-03', 'RP-04']);

  const selectorIds = await page.locator('[data-project-selector]').evaluateAll((elements) => (
    elements.map((element) => element.getAttribute('data-project-selector'))
  ));
  expect(selectorIds).toEqual(['rp01', 'rp02', 'rp03', 'rp04']);
  await expect(page.locator('.rp-eyebrow')).toHaveText('مشروعات مرجعية');
  await expect(page.locator(BODY)).not.toContainText('GS-PUB-003');

  await page.locator('[data-project-selector="rp04"]').click();
  await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp04');
  await expect(page.locator('.rp-active-project__identity')).toContainText('RP-04');
  await expect(page.locator('.rp-capability-map__core')).toContainText('RP-04');
});

test('machine/control states remain internal while localized truth stays visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();

  const publicText = await page.locator(BODY).innerText();
  expect(publicText).not.toContain('REFERENCE_ONLY');
  expect(publicText).not.toContain('UNAVAILABLE');
  expect(publicText).not.toContain('ROUTE_NOT_CONFIGURED');
  expect(publicText).toContain('مرجع سياقي فقط');
  expect(publicText).toContain('المسار الخارجي الموثوق غير متاح حاليًا');
});

test('comparison exposes project identity and all field meanings programmatically for every row', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);

  const rows = page.locator('[data-project-row]');
  await expect(rows).toHaveCount(4);

  const fieldLabels = [
    ['project', 'المشروع'],
    ['domain', 'المجال التشغيلي'],
    ['capability', 'القدرة التي يوضحها'],
    ['state', 'حالة الملخص'],
    ['route', 'المسار الخارجي'],
  ] as const;

  for (let index = 0; index < 4; index += 1) {
    const row = rows.nth(index);
    await expect(row).toHaveAccessibleName(new RegExp(`^المشروع: RP-0${index + 1} `));

    for (const [field, label] of fieldLabels) {
      const value = row.locator(`[data-comparison-field="${field}"]`);
      await expect(value).toHaveCount(1);
      await expect(value).toHaveAccessibleName(new RegExp(`^${label}: .+`));
    }
  }
});

test('public route copy avoids repository implementation wording while preserving unavailable-route truth', async ({ page }) => {
  await openFixture(page, 'ar');
  let publicText = await page.locator(BODY).innerText();
  expect(publicText).not.toContain('المستودع');
  expect(publicText.toLowerCase()).not.toContain('repository');
  expect(publicText).toContain('المسار الخارجي الموثوق غير متاح حاليًا');

  await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
  await expect(page.getByText('لا يتوفر حاليًا رابط موثوق إلى المصدر المستقل.')).toBeVisible();

  await openFixture(page, 'en');
  publicText = await page.locator(BODY).innerText();
  expect(publicText).not.toContain('المستودع');
  expect(publicText.toLowerCase()).not.toContain('repository');
  expect(publicText).toContain('Verified outbound route currently unavailable');

  await page.getByRole('button', { name: /boundaries and verification ledger/i }).click();
  await expect(page.getByText('No verified route to the independent source is currently available.')).toBeVisible();
});

test('capability-map disclaimer has production-readable type and contrast treatment', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);

  const disclaimer = page.locator('.rp-capability-map figcaption');
  await expectFontAtLeast(disclaimer, 12);
  await expect(disclaimer).toHaveCSS('color', 'rgb(174, 178, 181)');
});

for (const width of [430, 390]) {
  test(`mobile RP capability and evidence meaning-bearing copy stays readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openFixture(page);
    await page.locator('[data-project-selector="rp02"]').click();

    await expectFontAtLeast(page.locator('.rp-capability-map figcaption'), 12);
    await expectFontAtLeast(page.locator('.rp-capability-map__nodes strong').first(), 10);
    await expectFontAtLeast(page.locator('.rp-capability-map__core small'), 10);

    const toggle = page.getByRole('button', { name: /سجل الحدود والتحقق/ });
    await toggle.click();
    await expect(page.locator('.rp-ledger')).toHaveClass(/is-open/);
    await expectFontAtLeast(page.locator('.rp-ledger__evidence article p').first(), 12);
    await expectFontAtLeast(page.locator('.rp-state-label > strong').first(), 10);
    await expectNoHorizontalOverflow(page);
  });
}

test('reduced motion preserves selector and expanded-ledger behavior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 768, height: 1024 });
  await openFixture(page);

  await page.locator('[data-project-selector="rp01"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-project', 'rp02');

  const toggle = page.getByRole('button', { name: /سجل الحدود والتحقق/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.rp-ledger')).toHaveClass(/is-open/);
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

test('captures required exact-current reference body evidence', async ({ page }) => {
  test.slow();

  for (const width of [1440, 1024, 768, 430, 390]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-project-selector="rp02"]').click();
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `reference-projects-${width}-rp02.png`), fullPage: true, animations: 'disabled' });
  }

  for (const width of [1440, 768, 430, 390]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-project-selector="rp04"]').click();
    await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `reference-projects-${width}-rp04-expanded.png`), fullPage: true, animations: 'disabled' });
  }

  await page.setViewportSize({ width: 768, height: 1024 });
  await openFixture(page);
  await page.locator('[data-project-selector="rp01"]').focus();
  await page.keyboard.press('ArrowLeft');
  await page.locator('.rp-project-selector').screenshot({ path: resolve(EVIDENCE_DIR, 'reference-projects-768-selector-keyboard.png'), animations: 'disabled' });
});
