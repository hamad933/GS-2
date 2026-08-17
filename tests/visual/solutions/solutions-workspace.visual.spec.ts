import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { solutionFamilies } from '../../../src/data/solutions';
import {
  mapSolutionsExplorationToDiscovery,
  readStartDiscoveryRouteState,
} from '../../../src/integration/solutionsToDiscovery';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';

const EXPLORATION = '#solutions-exploration';
const EVIDENCE_DIR = resolve('tests/visual/solutions/evidence/final-public-w02');
const runtimeErrors = new WeakMap<Page, string[]>();

async function openSolutions(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-mode', 'explore');
}

async function openCompare(page: Page) {
  await page.getByRole('button', { name: 'قارن الحجوزات بالتشغيل' }).click();
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-mode', 'compare');
}

async function expectNoHorizontalOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
}

test.beforeAll(async () => { await mkdir(EVIDENCE_DIR, { recursive: true }); });
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
});
test.afterEach(async ({ page }) => { expect(runtimeErrors.get(page) ?? []).toEqual([]); });

test('exposes exactly the canonical six families early', async ({ page }) => {
  expect(solutionFamilies.map((family) => family.title)).toEqual([
    'مواقع الأعمال والخدمات',
    'التجارة الرقمية وتجارب العلامات',
    'الحجوزات والخدمات',
    'العقارات والأصول',
    'الأنظمة التشغيلية والبوابات',
    'التعليم والمعرفة والمحتوى',
  ]);
  await openSolutions(page);
  await expect(page.getByRole('tab')).toHaveCount(6);
  await expect(page.locator('.solutions-family-tab [data-asset-id$="-MSC-01"]')).toHaveCount(6);
  await expect(page.getByRole('tab', { name: /الحجوزات والخدمات/ })).toHaveAttribute('aria-selected', 'true');
});

test('selected family is product-led and removes configurator semantics', async ({ page }) => {
  await openSolutions(page);
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { name: 'الحجوزات والخدمات', exact: true })).toBeVisible();
  await expect(panel.getByText('متى يناسبني هذا النوع؟')).toBeVisible();
  await expect(panel.getByText('من يستخدمه؟')).toBeVisible();
  await expect(panel.getByText('كيف يعمل؟')).toBeVisible();
  await expect(panel.getByText('ما الذي يمكن أن يتضمنه؟')).toBeVisible();
  await expect(panel.locator('[data-asset-id="FAM-03-MSC-01"]')).toBeVisible();
  await expect(panel.locator('[data-asset-id^="FAM-03-DIR-"]')).toHaveCount(3);
  await expect(panel.getByText('اتجاهات استكشافية، وليست قوالب أو باقات أو منتجات جاهزة للبيع.')).toBeVisible();
  await expect(panel.getByText(/ليس عرض سعر/)).toBeVisible();
  await expect(panel.getByText('RP-03 — Booking & Service Operations')).toBeVisible();
  await expect(page.getByText(/Capability Builder|Project Pulse|CORE|RECOMMENDED|OPTIONAL/)).toHaveCount(0);
});

test('family navigation is keyboard operable and retains focus', async ({ page }) => {
  await openSolutions(page);
  const booking = page.getByRole('tab', { name: /الحجوزات والخدمات/ });
  await booking.focus();
  await page.keyboard.press('ArrowDown');
  const assets = page.getByRole('tab', { name: /العقارات والأصول/ });
  await expect(assets).toBeFocused();
  await expect(assets).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-family', 'assets');
});

test('exploration to START v1 carries only truthful selected-family context', () => {
  const prefill = mapSolutionsExplorationToDiscovery('booking', 'USER_DIRECT');
  expect(prefill).toEqual({
    version: START_DISCOVERY_PREFILL_VERSION,
    source: { adapter: 'solutions-exploration', label: 'استكشاف الحلول', referenceId: 'booking' },
    solutionFamilyId: 'booking',
    decisionOrigin: 'USER_DIRECT',
  });
  expect(prefill.selectedCapabilities).toBeUndefined();
  expect(prefill.capabilitySelections).toBeUndefined();
  expect(prefill.capturedFacts).toBeUndefined();
  expect(prefill.configurationPreference).toBeUndefined();
  expect(prefill.budgetPreference).toBeUndefined();
  expect(prefill.knownDependencies).toBeUndefined();
  expect(prefill.recommendedFamily).toBeUndefined();
  const sanitized = readStartDiscoveryRouteState({ discoveryPrefill: prefill });
  expect(sanitized?.solutionFamilyId).toBe('booking');
  expect(sanitized?.decisionOrigin).toBe('USER_DIRECT');
});

test('selected CTA and escape hatch expose distinct integration intents', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: 'ابدأ من هذا الاتجاه' }).first().click();
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-kind', 'family');
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-family', 'booking');
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-origin', 'USER_DIRECT');
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'لست متأكدًا من الاتجاه؟ ساعدني على الاختيار' }).click();
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-kind', 'discover');
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-family', 'none');
});

test('compare is bounded inside SOLUTIONS and preserves the central distinction', async ({ page }) => {
  await openSolutions(page);
  await openCompare(page);
  await expect(page.getByRole('heading', { name: 'الحجوزات والخدمات أم الأنظمة التشغيلية والبوابات؟' })).toBeVisible();
  await expect(page.locator('.solutions-compare__visuals [data-asset-id="FAM-03-MSC-01"]')).toBeVisible();
  await expect(page.locator('.solutions-compare__visuals [data-asset-id="FAM-05-MSC-01"]')).toBeVisible();
  await expect(page.getByText('رحلة العميل إلى الخدمة والموعد')).toBeVisible();
  await expect(page.getByText('عمل الفريق والطلبات والسجلات')).toBeVisible();
  await expect(page.locator('.solutions-compare-row')).toHaveCount(5);
});

test('compare action carries USER_COMPARE provenance and undecided returns to exploration', async ({ page }) => {
  await openSolutions(page);
  await openCompare(page);
  await page.getByRole('button', { name: 'ابدأ من الأنظمة التشغيلية والبوابات' }).click();
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-family', 'portals');
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-origin', 'USER_COMPARE');
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await openCompare(page);
  await page.getByRole('button', { name: 'لم أحسم بعد — ارجع إلى جميع الحلول' }).click();
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-mode', 'explore');
});

for (const width of [1440, 768, 430, 390]) {
  test(`selected family renders without material overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 1000 });
    await openSolutions(page);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `w02-${width}-selected-booking.png`), fullPage: true });
  });

  test(`compare renders progressively without material overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 1000 });
    await openSolutions(page);
    await openCompare(page);
    await expectNoHorizontalOverflow(page);
    if (width <= 430) {
      await expect(page.locator('.solutions-compare__desktop')).toBeHidden();
      await expect(page.getByText('سؤال 1 من 5')).toBeVisible();
      await page.getByRole('button', { name: 'السؤال التالي' }).click();
      await expect(page.getByText('سؤال 2 من 5')).toBeVisible();
    } else {
      await expect(page.locator('.solutions-compare__desktop')).toBeVisible();
    }
    await page.screenshot({ path: resolve(EVIDENCE_DIR, `w02-${width}-compare.png`), fullPage: true });
  });
}
