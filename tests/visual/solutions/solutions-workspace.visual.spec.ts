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
const EVIDENCE_DIR = resolve('tests/visual/solutions/evidence/deep-r1');
const runtimeErrors = new WeakMap<Page, string[]>();

async function openSolutions(page: Page) {
  await page.goto('/solutions');
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

async function routePrefill(page: Page) {
  return page.evaluate(() => {
    const state = window.history.state as { usr?: { discoveryPrefill?: Record<string, unknown> } } | null;
    return state?.usr?.discoveryPrefill ?? null;
  });
}

function expectUserOwnedPrefill(
  prefill: Record<string, unknown> | null,
  familyId: string,
  decisionOrigin: 'USER_DIRECT' | 'USER_COMPARE',
) {
  expect(prefill).toMatchObject({
    version: START_DISCOVERY_PREFILL_VERSION,
    source: {
      adapter: 'solutions-exploration',
      label: 'استكشاف الحلول',
      referenceId: familyId,
    },
    solutionFamilyId: familyId,
    decisionOrigin,
  });
  expect(prefill).not.toHaveProperty('recommendedFamily');
  expect(prefill).not.toHaveProperty('candidateIds');
  expect(prefill).not.toHaveProperty('confidence');
  expect(prefill).not.toHaveProperty('ranking');
  expect(prefill).not.toHaveProperty('recommendationResolution');
  expect(prefill).not.toHaveProperty('selectedCapabilities');
  expect(prefill).not.toHaveProperty('capabilitySelections');
}

test.beforeAll(async () => {
  await mkdir(EVIDENCE_DIR, { recursive: true });
});

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) ?? []).toEqual([]);
});

test('preserves the canonical six-family product truth and approved visual recognition', async ({ page }) => {
  expect(solutionFamilies.map((family) => family.title)).toEqual([
    'مواقع الأعمال والخدمات',
    'التجارة الرقمية وتجارب العلامات',
    'الحجوزات والخدمات',
    'العقارات والأصول',
    'الأنظمة التشغيلية والبوابات',
    'التعليم والمعرفة والمحتوى',
  ]);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await openSolutions(page);
  await expect(page.getByRole('tab')).toHaveCount(6);

  const recognition = [
    ['business', 'FAM-01-EMB-01'],
    ['commerce', 'FAM-02-EMB-01'],
    ['booking', 'FAM-03-EMB-01'],
    ['assets', 'FAM-04-EMB-01'],
    ['portals', 'FAM-05-EMB-01'],
    ['knowledge', 'FAM-06-EMB-01'],
  ] as const;

  for (const [familyId, assetId] of recognition) {
    await expect(page.locator(`[data-family-id="${familyId}"] [data-asset-id="${assetId}"]`)).toBeVisible();
  }

  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { name: 'الحجوزات والخدمات', exact: true })).toBeVisible();
  await expect(panel.getByText('متى يناسبني هذا النوع؟')).toBeVisible();
  await expect(panel.getByText('من يستخدمه؟')).toBeVisible();
  await expect(panel.getByText('كيف يعمل؟')).toBeVisible();
  await expect(panel.getByText('ما الذي يمكن أن يتضمنه؟')).toBeVisible();
  await expect(panel.getByText('اتجاهات استكشافية، وليست قوالب أو باقات أو منتجات جاهزة للبيع.')).toBeVisible();
  await expect(panel.getByText(/ليس عرض سعر/)).toBeVisible();
  await expect(panel.locator('.solutions-reference')).toHaveAttribute('data-reference-code', 'RP03');
  await expect(page.getByText(/Capability Builder|Project Pulse|CORE|RECOMMENDED|OPTIONAL/)).toHaveCount(0);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'solutions-deep-r1-1440-product-truth.png'), fullPage: true });
});

test('reference surface remains truthful across all six families', async ({ page }) => {
  await openSolutions(page);
  const expected = [
    ['business', 'unavailable', 'none', 'لا يوجد مرجع مطابق متاح حاليًا'],
    ['commerce', 'available', 'RP01', 'تجربة تجارة وهوية بصرية متصلة'],
    ['booking', 'available', 'RP03', 'حجز يبدأ من احتياج واضح'],
    ['assets', 'available', 'RP04', 'الأصول في مساحة قرار واحدة'],
    ['portals', 'available', 'RP02', 'نظام تشغيل يوضّح العمل'],
    ['knowledge', 'unavailable', 'none', 'لا يوجد مرجع مطابق متاح حاليًا'],
  ] as const;

  for (const [familyId, state, code, title] of expected) {
    await page.locator(`[data-family-id="${familyId}"]`).click();
    const reference = page.locator('.solutions-reference');
    await expect(reference).toHaveAttribute('data-reference-state', state);
    await expect(reference).toHaveAttribute('data-reference-code', code);
    await expect(reference).toContainText(title);
    await expect(reference).not.toContainText('REFERENCE_ONLY');
    await expect(reference).not.toContainText('NOT_AVAILABLE');
  }
});

test('exploration adapter carries only selected-family user provenance', () => {
  for (const origin of ['USER_DIRECT', 'USER_COMPARE'] as const) {
    const prefill = mapSolutionsExplorationToDiscovery('booking', origin);
    expectUserOwnedPrefill(prefill as Record<string, unknown>, 'booking', origin);
    const sanitized = readStartDiscoveryRouteState({ discoveryPrefill: prefill });
    expect(sanitized?.solutionFamilyId).toBe('booking');
    expect(sanitized?.decisionOrigin).toBe(origin);
    expect(sanitized?.recommendedFamily).toBeUndefined();
    expect(sanitized?.recommendationResolution).toBeUndefined();
  }
});

test('DIRECT performs a real route journey into START and Browser Back/Forward restores SOLUTIONS', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('tab', { name: /العقارات والأصول/ }).click();
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-family', 'assets');

  await page.locator('.solutions-selected__copy').getByRole('button', { name: 'ابدأ من هذا الاتجاه' }).click();
  await expect(page).toHaveURL(/\/start$/);
  expectUserOwnedPrefill(await routePrefill(page), 'assets', 'USER_DIRECT');

  await expect(page.locator('.start-discovery')).toHaveAttribute('data-selected-family', 'assets');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-recommended-family', '');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('العقارات والأصول');
  await expect(page.locator('[data-testid="system-recommendation"]')).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-family', 'assets');
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-mode', 'explore');

  await page.goForward();
  await expect(page).toHaveURL(/\/start$/);
  expectUserOwnedPrefill(await routePrefill(page), 'assets', 'USER_DIRECT');
});

test('COMPARE performs a real USER_COMPARE route and restores the compare decision workspace', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSolutions(page);
  await openCompare(page);

  await page.getByRole('button', { name: 'السؤال التالي' }).click();
  await expect(page.locator('.solutions-compare-step')).toHaveAttribute('data-compare-step', '2');
  await page.getByRole('button', { name: 'السؤال التالي' }).click();
  await expect(page.locator('.solutions-compare-step')).toHaveAttribute('data-compare-step', '3');

  await page.getByRole('button', { name: 'ابدأ من الأنظمة التشغيلية والبوابات' }).click();
  await expect(page).toHaveURL(/\/start$/);
  expectUserOwnedPrefill(await routePrefill(page), 'portals', 'USER_COMPARE');

  await expect(page.locator('.start-discovery')).toHaveAttribute('data-selected-family', 'portals');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-recommended-family', '');
  await expect(page.locator('[data-testid="system-recommendation"]')).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-mode', 'compare');
  await expect(page.locator('.solutions-compare-step')).toHaveAttribute('data-compare-step', '3');

  await page.goForward();
  await expect(page).toHaveURL(/\/start$/);
  expectUserOwnedPrefill(await routePrefill(page), 'portals', 'USER_COMPARE');
});

test('uncertain entry reaches START without fabricating a family or recommendation', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: 'لست متأكدًا من الاتجاه؟ ساعدني على الاختيار' }).click();
  await expect(page).toHaveURL(/\/start$/);
  expect(await routePrefill(page)).toBeNull();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-selected-family', '');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-recommended-family', '');
});

test('desktop rail uses vertical semantics and retains focus through keyboard selection', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openSolutions(page);
  const rail = page.getByRole('tablist', { name: 'اختر عائلة حل لاستكشافها' });
  await expect(rail).toHaveAttribute('aria-orientation', 'vertical');

  const booking = page.getByRole('tab', { name: /الحجوزات والخدمات/ });
  await booking.focus();
  await page.keyboard.press('ArrowDown');
  const assets = page.getByRole('tab', { name: /العقارات والأصول/ });
  await expect(assets).toBeFocused();
  await expect(assets).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-family', 'assets');
});

test('mobile rail uses horizontal RTL keyboard semantics and remains visibly discoverable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSolutions(page);

  const rail = page.getByRole('tablist', { name: 'اختر عائلة حل لاستكشافها' });
  await expect(rail).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(page.locator('.solutions-browser__position')).toBeVisible();

  const booking = page.getByRole('tab', { name: /الحجوزات والخدمات/ });
  await booking.focus();
  await page.keyboard.press('ArrowLeft');
  const assets = page.getByRole('tab', { name: /العقارات والأصول/ });
  await expect(assets).toBeFocused();
  await expect(assets).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(booking).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: /مواقع الأعمال والخدمات/ })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: /التعليم والمعرفة والمحتوى/ })).toBeFocused();
});

test('Compare moves focus into the workspace and returns it to the invoking control', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openSolutions(page);

  const railTrigger = page.getByRole('button', { name: 'قارن الحجوزات بالتشغيل' });
  await railTrigger.click();
  const compareTitle = page.getByRole('heading', { name: 'الحجوزات والخدمات أم الأنظمة التشغيلية والبوابات؟' });
  await expect(compareTitle).toBeFocused();

  await page.getByRole('button', { name: 'العودة إلى جميع الحلول' }).click();
  await expect(railTrigger).toBeFocused();

  const selectedTrigger = page.getByRole('button', { name: 'قارن بالحجوزات والتشغيل' });
  await selectedTrigger.click();
  await expect(compareTitle).toBeFocused();
  await page.getByRole('button', { name: 'العودة إلى جميع الحلول' }).click();
  await expect(selectedTrigger).toBeFocused();
});

test('mobile Compare step changes preserve focus continuity', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSolutions(page);
  await openCompare(page);

  await page.getByRole('button', { name: 'السؤال التالي' }).click();
  const step = page.locator('.solutions-compare-step');
  await expect(step).toHaveAttribute('data-compare-step', '2');
  await expect(step).toBeFocused();

  for (let stepNumber = 3; stepNumber <= 5; stepNumber += 1) {
    await page.getByRole('button', { name: 'السؤال التالي' }).click();
    await expect(step).toHaveAttribute('data-compare-step', String(stepNumber));
  }
  await page.getByRole('button', { name: 'عرض الخلاصة' }).click();
  const summary = page.locator('.solutions-compare-summary');
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
});

test('mixed Arabic/LTR content preserves bidi isolation', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('tab', { name: /التجارة الرقمية وتجارب العلامات/ }).click();

  const referenceHeading = page.locator('.solutions-reference h3');
  await expect(referenceHeading.locator('bdi')).toHaveText('RP-01');
  expect(await referenceHeading.evaluate((node) => getComputedStyle(node).direction)).toBe('rtl');
  expect(await referenceHeading.locator('bdi').evaluate((node) => getComputedStyle(node).direction)).toBe('ltr');

  const budgetCodes = page.locator('.solutions-budget strong bdi');
  await expect(budgetCodes).toHaveCount(2);
  for (const code of await budgetCodes.all()) {
    expect(await code.evaluate((node) => getComputedStyle(node).direction)).toBe('ltr');
  }
});

for (const width of [1440, 768, 430, 390]) {
  test(`selected family remains readable and overflow-free at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 1000 });
    await openSolutions(page);
    await expectNoHorizontalOverflow(page);

    const rail = page.getByRole('tablist', { name: 'اختر عائلة حل لاستكشافها' });
    await expect(rail).toHaveAttribute('aria-orientation', width <= 760 ? 'horizontal' : 'vertical');
    if (width <= 760) {
      await expect(page.locator('.solutions-browser__position')).toBeVisible();
    } else {
      await expect(page.locator('.solutions-browser__position')).toBeHidden();
    }

    await page.screenshot({ path: resolve(EVIDENCE_DIR, `solutions-deep-r1-${width}-selected-booking.png`), fullPage: true });
  });

  test(`compare remains readable and overflow-free at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 1000 });
    await openSolutions(page);
    await openCompare(page);
    await expectNoHorizontalOverflow(page);

    if (width <= 760) {
      await expect(page.locator('.solutions-compare__desktop')).toBeHidden();
      await expect(page.locator('.solutions-compare__mobile')).toBeVisible();
      await expect(page.getByText('سؤال 1 من 5')).toBeVisible();
    } else {
      await expect(page.locator('.solutions-compare__desktop')).toBeVisible();
    }

    await page.screenshot({ path: resolve(EVIDENCE_DIR, `solutions-deep-r1-${width}-compare.png`), fullPage: true });
  });
}
