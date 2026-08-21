import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const FIXTURE = '/tests/visual/fixtures/how-we-work/index.html';
const EVIDENCE_ROOT = process.env.VISUAL_EVIDENCE_DIR ?? 'visual-evidence/public-site';
const EVIDENCE_DIR = resolve(EVIDENCE_ROOT, 'how-we-work-deep-r1');
const BODY = '.how-we-work-body';
const STAGES = ['discovery', 'fit', 'scope', 'risk', 'build', 'quality', 'transition'] as const;

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

test('all seven method stages support pointer progression', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  for (const stageId of STAGES) {
    await page.locator(`[data-method-stage="${stageId}"]`).click();
    await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', stageId);
  }
  await expect(page.getByRole('heading', { name: 'من القرار إلى المشروع' })).toBeVisible();
});

test('desktop tablist exposes vertical semantics and matching keyboard interaction', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  const selector = page.getByRole('tablist', { name: 'اختر مرحلة المنهج' });
  await expect(selector).toHaveAttribute('aria-orientation', 'vertical');

  const first = page.locator('[data-method-stage="discovery"]');
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS('outline-style', 'solid');

  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-method-stage="fit"]')).toBeFocused();
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'fit');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'discovery');
  await page.keyboard.press('End');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'transition');
  await page.keyboard.press('Home');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'discovery');
});

test('responsive tablist exposes horizontal semantics and RTL-aware arrow interaction', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openFixture(page);
  const selector = page.getByRole('tablist', { name: 'اختر مرحلة المنهج' });
  await expect(selector).toHaveAttribute('aria-orientation', 'horizontal');

  const first = page.locator('[data-method-stage="discovery"]');
  await first.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-method-stage="fit"]')).toBeFocused();
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'fit');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'discovery');
  await page.keyboard.press('End');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'transition');
  await page.keyboard.press('Home');
  await expect(page.locator(BODY)).toHaveAttribute('data-active-stage', 'discovery');
});

test('stage 05 plans implementation without starting it before the separate start decision', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  await page.locator('[data-method-stage="build"]').click();
  const panel = page.getByRole('tabpanel');
  await expect(panel).toContainText('تخطيط التنفيذ والمراجعة');
  await expect(panel).toContainText('التنفيذ نفسه لا يبدأ');
  await expect(panel).toContainText('قرار بدء منفصل');
  await expect(page.locator('.project-transition')).toContainText('لا تبدأ أعمال التنفيذ');
  await expect(page.locator('.project-transition')).toContainText('قرار بدء مستقل');
});

test('buyer-facing framing explains before, during, and before-start collaboration without public control labels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  const relationship = page.locator('.working-relationship');
  await expect(relationship).toContainText('قبل تشكيل الحل');
  await expect(relationship).toContainText('أثناء تشكيل القرار');
  await expect(relationship).toContainText('قبل أي تنفيذ');
  await expect(relationship).toContainText('أنت تشرح العمل كما هو');
  await expect(page.locator(BODY)).not.toContainText('GS-PUB-004');
  await expect(page.locator(BODY)).not.toContainText('GS / METHOD');
  await expect(page.locator(BODY)).not.toContainText('CONTROLLED PROGRESSION');
  await expect(page.locator(BODY)).not.toContainText('L01');
});

for (const width of [1440, 768, 430, 390]) {
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

test('390px keeps meaning-bearing small text readable and recomposes the long page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFixture(page);

  const readability = await page.evaluate(() => {
    const selectors = [
      '.method-stage-selector button strong',
      '.method-gate dt',
      '.method-gate dd',
      '.working-relationship li > span',
      '.working-relationship li p',
      '.scope-architecture > header > span',
      '.scope-architecture li p',
      '.risk-register__fields span',
      '.quality-evidence li p',
      '.about-gs > aside p',
      '.about-gs__cta small',
    ];
    return selectors.map((selector) => ({
      selector,
      sizes: Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    }));
  });

  for (const group of readability) {
    expect(group.sizes.length, `${group.selector} should resolve`).toBeGreaterThan(0);
    expect(Math.min(...group.sizes), `${group.selector} text floor`).toBeGreaterThanOrEqual(12);
  }

  await expect(page.locator('.method-blueprint__field')).toBeHidden();
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(scrollHeight).toBeLessThanOrEqual(7600);
});

test('430px preserves compact recomposition and a truthful final discovery action', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await openFixture(page);
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(scrollHeight).toBeLessThanOrEqual(7600);

  const cta = page.getByRole('link', { name: 'ابدأ الاكتشاف' });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/start');
  await expect(page.locator('.about-gs__cta')).toContainText('لا تنشئ عقداً أو مشروعاً');
  await cta.focus();
  await expect(cta).toBeFocused();
  await expect(cta).toHaveCSS('outline-style', 'solid');
});

test('method body preserves Arabic RTL and English LTR', async ({ page }) => {
  await openFixture(page, 'ar');
  await expect(page.locator(BODY)).toHaveAttribute('dir', 'rtl');
  await openFixture(page, 'en');
  await expect(page.locator(BODY)).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: /From an incomplete need/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start discovery' })).toHaveAttribute('href', '/start');
});

test('reduced motion removes meaningful transition duration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page);
  const durationMs = await page.locator('.method-blueprint__axis i').evaluate((element) => {
    const raw = getComputedStyle(element).transitionDuration.split(',')[0]?.trim() ?? '0s';
    if (raw.endsWith('ms')) return Number.parseFloat(raw);
    if (raw.endsWith('s')) return Number.parseFloat(raw) * 1000;
    return Number.POSITIVE_INFINITY;
  });
  expect(durationMs).toBeLessThanOrEqual(0.1);
});

test('captures required How We Work reference-only evidence', async ({ page }) => {
  test.slow();
  for (const width of [1440, 768, 430, 390]) {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openFixture(page);
    await page.locator('[data-method-stage="build"]').click();
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `how-we-work-${width}-build-boundary.png`), fullPage: true, animations: 'disabled' });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openFixture(page, 'en');
  await page.locator('[data-method-stage="quality"]').click();
  await page.locator('.method-corridor').screenshot({ path: resolve(EVIDENCE_DIR, 'how-we-work-1440-ltr-quality.png'), animations: 'disabled' });
});
