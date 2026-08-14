import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { recommendFromFacts } from '../../../src/data/solutions/finder';
import { createStartDiscoveryDraft } from '../../../src/features/start-discovery/discoveryModel';
import { mapSolutionsDecisionToDiscovery } from '../../../src/integration/solutionsToDiscovery';
import { readStartDiscoveryRouteState } from '../../../src/routes/startDiscoveryRouteState';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';
import type { DecisionSnapshot } from '../../../src/types/solutions';

const WORKSPACE = '#solutions-decision-workspace';
const EVIDENCE_DIR = resolve('tests/visual/solutions/evidence');
const runtimeErrors = new WeakMap<Page, string[]>();

async function openWorkspace(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'entry');
}

async function chooseFinderOption(page: Page, name: string, last = false) {
  await page.getByRole('radio', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: last ? /بناء الاتجاه/ : /السؤال التالي/ }).click();
}

async function reachPortalRecommendation(page: Page) {
  await openWorkspace(page);
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  await chooseFinderOption(page, 'تنظيم عمل وطلبات داخلية');
  await chooseFinderOption(page, 'عمليات وفرق');
  await chooseFinderOption(page, 'فريق داخلي');
  await page.getByRole('radio', { name: /أنظمة أو تكاملات مهمة/ }).click();
  await page.getByPlaceholder(/نظام قائم/).fill('نظام داخلي قائم يحتاج تحققًا تقنيًا');
  await page.getByRole('button', { name: /بناء الاتجاه/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-family', 'portals');
  await expect(page.getByRole('heading', { name: 'الأنظمة التشغيلية والبوابات' })).toBeVisible();
}

async function reachSummary(page: Page) {
  await reachPortalRecommendation(page);
  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
  await page.getByRole('button', { name: /تكاملات وهوية وصلاحيات متقدمة/ }).click();
  await page.getByRole('button', { name: /مقارنة اتجاه التكوين/ }).click();
  await page.getByRole('radio', { name: /ربط عدة مسارات مترابطة/ }).click();
  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  await page.getByRole('radio', { name: /مرونة حسب القيمة/ }).click();
  await page.getByPlaceholder('اكتب النطاق أو القيد بصيغتك').fill('نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات');
  await page.getByText('عملية تشغيل قابلة للوصف', { exact: true }).click();
  await page.getByRole('button', { name: /إنتاج ملخص القرار/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'summary');
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function expectMinimumFontSize(locator: Locator, minimum: number) {
  await expect(locator).toBeVisible();
  const fontSize = await locator.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(minimum);
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

test('Finder keeps mostly-unknown evidence unresolved instead of picking a hidden winner', () => {
  const recommendation = recommendFromFacts({
    outcome: 'unknown',
    activity: 'mixed',
    audience: 'unknown',
    complexity: 'unknown',
    constraints: '',
  });

  expect(recommendation.resolution).toBe('insufficient');
  expect(recommendation.recommendedId).toBeUndefined();
  expect(recommendation.candidateIds).toEqual(['business', 'portals']);
});

test('Finder preserves a tied top result without order-based tie breaking', () => {
  const recommendation = recommendFromFacts({
    outcome: 'unknown',
    activity: 'services',
    audience: 'customers',
    complexity: 'unknown',
    constraints: 'لا توجد قيود إضافية معروفة الآن',
  });

  expect(recommendation.resolution).toBe('tied');
  expect(recommendation.recommendedId).toBeUndefined();
  expect(recommendation.candidateIds).toEqual(['business', 'booking']);
});

test('Finder keeps decisive cases deterministic', () => {
  const facts = {
    outcome: 'operate',
    activity: 'operations',
    audience: 'team',
    complexity: 'integrations',
    constraints: 'نظام داخلي قائم',
  } as const;

  const first = recommendFromFacts(facts);
  const second = recommendFromFacts(facts);
  expect(first.resolution).toBe('decisive');
  expect(first.recommendedId).toBe('portals');
  expect(second).toEqual(first);
});

test('v1 handoff preserves stable family identity, decision origin, and resolution additively', () => {
  const snapshot: DecisionSnapshot = {
    entryMode: 'discover',
    facts: { constraints: '' },
    recommendedFamily: 'business',
    decisionOrigin: 'USER_OPEN_DIRECTION',
    recommendationResolution: 'tied',
    selectedCapabilities: [],
    capabilitySelections: [],
    configuration: 'focused',
    budgetPreference: 'unknown',
    budgetRange: '',
    confirmedDependencies: [],
    unknowns: ['تعادل يحتاج معلومة مميِّزة'],
    evidenceState: 'REFERENCE_ONLY',
  };

  const prefill = mapSolutionsDecisionToDiscovery(snapshot);
  expect(prefill.version).toBe(START_DISCOVERY_PREFILL_VERSION);
  expect(prefill.solutionFamilyId).toBe('business');
  expect(prefill.decisionOrigin).toBe('USER_OPEN_DIRECTION');
  expect(prefill.recommendationResolution).toBe('tied');

  const sanitized = readStartDiscoveryRouteState({ discoveryPrefill: prefill });
  expect(sanitized?.solutionFamilyId).toBe('business');
  expect(sanitized?.decisionOrigin).toBe('USER_OPEN_DIRECTION');
  expect(sanitized?.recommendationResolution).toBe('tied');

  const draft = createStartDiscoveryDraft(sanitized, 'configured');
  expect(draft.solutionFamilyId).toBe('business');
  expect(draft.decisionOrigin).toBe('USER_OPEN_DIRECTION');
  expect(draft.recommendationResolution).toBe('tied');

  const legacyDraft = createStartDiscoveryDraft({
    version: START_DISCOVERY_PREFILL_VERSION,
    recommendedFamily: 'عائلة قديمة صالحة في v1',
  });
  expect(legacyDraft.recommendedFamily).toBe('عائلة قديمة صالحة في v1');
  expect(legacyDraft.solutionFamilyId).toBe('');
  expect(legacyDraft.decisionOrigin).toBeUndefined();
});

test('keeps all three entry modes inside one continuous workspace', async ({ page }) => {
  await openWorkspace(page);

  for (const [label, mode] of [
    ['ساعدني أكتشف ما أحتاجه', 'discover'],
    ['أعرف تقريبًا ما أحتاجه', 'direction'],
    ['أريد مقارنة الخيارات', 'compare'],
  ] as const) {
    await page.getByRole('button', { name: new RegExp(label) }).click();
    await expect(page.locator(WORKSPACE)).toHaveAttribute('data-mode', mode);
    await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'qualify');
    await expect(page.locator('[data-step-focus="qualify"]')).toBeFocused();
    await page.getByRole('button', { name: 'تغيير نقطة البداية' }).click();
    await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'entry');
    await expect(page.locator('#gsdw-entry-title')).toBeFocused();
  }
});

test('exposes all six established families and their contextual state', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: /أعرف تقريبًا ما أحتاجه/ }).click();

  const titles = [
    'مواقع الأعمال والخدمات',
    'التجارة الرقمية وتجارب العلامات',
    'الحجوزات والخدمات',
    'العقارات والأصول',
    'الأنظمة التشغيلية والبوابات',
    'التعليم والمعرفة والمحتوى',
  ];

  for (const title of titles) {
    const family = page.getByRole('button', { name: new RegExp(title) });
    await family.click();
    await expect(family).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.gsdw-quick-context')).toBeVisible();
  }
});

test('Finder produces system recommendation semantics and deterministic focus handoff', async ({ page }) => {
  await reachPortalRecommendation(page);
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-decision-origin', 'SYSTEM_FINDER');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-recommendation-resolution', 'decisive');
  await expect(page.locator('#gsdw-recommendation-title')).toBeFocused();
  await expect(page.getByText('اتجاه أولي قابل للمراجعة')).toBeVisible();
  await expect(page.getByText('RECOMMENDED DIRECTION')).toBeVisible();
  await expect(page.getByText('عمق التشغيل: أنظمة أو تكاملات مهمة')).toBeVisible();
  await expect(page.getByText('المعلومات الناقصة لا تخفض «نسبة تطابق»')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الحجوزات والخدمات' })).toBeVisible();
});

test('direct selection stays user-selected and hands focus through configure and summary', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: /أعرف تقريبًا ما أحتاجه/ }).click();
  await page.getByRole('button', { name: /مواقع الأعمال والخدمات/ }).click();
  await page.getByRole('button', { name: /مراجعة هذا الاتجاه/ }).click();

  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-decision-origin', 'USER_DIRECT');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-recommendation-resolution', 'unset');
  await expect(page.locator('#gsdw-recommendation-title')).toBeFocused();
  await expect(page.getByText('اختيارك المباشر')).toBeVisible();
  await expect(page.getByText('RECOMMENDED DIRECTION')).toHaveCount(0);

  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
  await expect(page.locator('#gsdw-configure-title')).toBeFocused();
  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  await page.getByRole('button', { name: /إنتاج ملخص القرار/ }).click();
  await expect(page.locator('#gsdw-summary-title')).toBeFocused();
  await expect(page.getByText('الاتجاه الذي اخترته', { exact: true })).toBeVisible();
});

test('mostly-unknown Finder can become an explicit user-selected open direction without fabricating recommendation certainty', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  await chooseFinderOption(page, 'لست متأكدًا بعد');
  await chooseFinderOption(page, 'نشاط مختلط أو غير محسوم');
  await chooseFinderOption(page, 'غير معروف بعد');
  await chooseFinderOption(page, 'غير معروف بعد', true);

  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-recommendation-resolution', 'insufficient');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-family', 'unset');
  await expect(page.getByRole('heading', { name: 'لا يوجد اتجاه منفرد يمكن تبريره بعد.' })).toBeFocused();
  await expect(page.locator('[data-open-family="business"]')).toBeVisible();
  await expect(page.locator('[data-open-family="portals"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /تكوين الاتجاه/ })).toHaveCount(0);

  await page.getByRole('button', { name: /اختيار مواقع الأعمال والخدمات/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-decision-origin', 'USER_OPEN_DIRECTION');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-recommendation-resolution', 'insufficient');
  await expect(page.locator('#gsdw-recommendation-title')).toBeFocused();
  await expect(page.getByText('اختيارك مع بقاء معلومات ناقصة')).toBeVisible();
  await expect(page.getByText('RECOMMENDED DIRECTION')).toHaveCount(0);
});

test('supports bounded comparison and labels the resulting direction as a user choice', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: /أريد مقارنة الخيارات/ }).click();
  await page.getByRole('button', { name: /التجارة الرقمية وتجارب العلامات/ }).click();
  await page.getByRole('button', { name: /الأنظمة التشغيلية والبوابات/ }).click();
  await expect(page.getByLabel('مقارنة اتجاهي الحل')).toBeVisible();
  await page.getByRole('button', { name: /اعتماد التجارة الرقمية وتجارب العلامات/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-family', 'commerce');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-decision-origin', 'USER_COMPARE');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-recommendation-resolution', 'unset');
  await expect(page.locator('#gsdw-recommendation-title')).toBeFocused();
  await expect(page.getByText('اختيارك بعد المقارنة')).toBeVisible();
  await expect(page.getByText('RECOMMENDED DIRECTION')).toHaveCount(0);
  await expect(page.getByText('اتجاه بديل يستحق النظر')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الأنظمة التشغيلية والبوابات' })).toBeVisible();
});

test('mobile Compare and configuration decision text stays readable without overflow', async ({ page }) => {
  for (const [width, height] of [[390, 844], [768, 1024]] as const) {
    await page.setViewportSize({ width, height });
    await openWorkspace(page);
    await page.getByRole('button', { name: /أريد مقارنة الخيارات/ }).click();
    await page.getByRole('button', { name: /التجارة الرقمية وتجارب العلامات/ }).click();
    await page.getByRole('button', { name: /الأنظمة التشغيلية والبوابات/ }).click();

    for (const selector of [
      '.gsdw-comparison-head > span',
      '.gsdw-comparison-head > strong',
      '.gsdw-comparison-row > span',
      '.gsdw-comparison-row > p',
    ]) {
      await expectMinimumFontSize(page.locator(selector).first(), 10);
    }
    await expectMinimumFontSize(page.locator('.gsdw-comparison-actions button').first(), 11);
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: /اعتماد التجارة الرقمية وتجارب العلامات/ }).click();
    await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
    for (const label of page.locator('.gsdw-config-phases button > span').all()) {
      await expectMinimumFontSize(label, 11);
    }
    await expectNoHorizontalOverflow(page);
  }
});

test('mobile progress retains semantic stage names and current-step context', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkspace(page);
  const progressItems = page.locator('.gsdw-progress li');
  await expect(progressItems).toHaveCount(5);
  await expect(progressItems.nth(0)).toHaveAttribute('aria-label', /نقطة البداية.*المرحلة الحالية/);
  await expect(progressItems.nth(1)).toHaveAttribute('aria-label', /فهم الاحتياج/);
  await page.getByRole('button', { name: /أريد مقارنة الخيارات/ }).click();
  await expect(progressItems.nth(1)).toHaveAttribute('aria-label', /فهم الاحتياج.*المرحلة الحالية/);
  await expectNoHorizontalOverflow(page);
});

test('configures contextual capabilities, option depth, budget, dependencies, and summary', async ({ page }) => {
  await reachSummary(page);
  await expect(page.getByText('تكاملات وهوية وصلاحيات متقدمة', { exact: true })).toBeVisible();
  await expect(page.getByText('مرونة حسب القيمة', { exact: true })).toBeVisible();
  await expect(page.getByText('نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات')).toBeVisible();
  await expect(page.locator('.gsdw-summary-row[data-kind="unknown"]')).toHaveCount(1);
  await expect(page.getByText('مرجع سياقي فقط', { exact: true })).toBeVisible();
  await expect(page.getByText('REFERENCE_ONLY', { exact: true })).toHaveCount(0);
});

test('supports edit and revisit behavior without losing the current decision', async ({ page }) => {
  await reachSummary(page);
  await page.getByRole('button', { name: /عدّل الميزانية والاعتمادات/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'configure');
  await expect(page.locator('.gsdw-configure')).toHaveAttribute('data-phase', 'constraints');
  await expect(page.getByPlaceholder('اكتب النطاق أو القيد بصيغتك')).toHaveValue('نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات');
  await page.getByRole('button', { name: /إنتاج ملخص القرار/ }).click();
  await page.getByRole('button', { name: /تجهيز الانتقال إلى Discovery/ }).click();
  await expect(page.getByRole('status')).toContainText('لم يُرسل شيء بعد');
  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-ready', 'true');
});

test('supports Arrow-key roving tabindex in Finder, configuration, and budget radio groups', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  const finderGroup = page.getByRole('radiogroup').first();
  const finderRadios = finderGroup.getByRole('radio');
  await expect(finderRadios.nth(0)).toHaveAttribute('tabindex', '0');
  await expect(finderRadios.nth(1)).toHaveAttribute('tabindex', '-1');
  await finderRadios.nth(0).focus();
  await page.keyboard.press('ArrowDown');
  await expect(finderRadios.nth(1)).toBeFocused();
  await expect(finderRadios.nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(finderRadios.nth(1)).toHaveAttribute('tabindex', '0');
  await expect(finderRadios.nth(0)).toHaveAttribute('tabindex', '-1');

  await reachPortalRecommendation(page);
  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
  await page.getByRole('button', { name: /مقارنة اتجاه التكوين/ }).click();
  const configurationGroup = page.getByRole('radiogroup', { name: 'اختر اتجاه التكوين' });
  let activeRadio = configurationGroup.locator('[role="radio"][tabindex="0"]');
  await activeRadio.focus();
  await page.keyboard.press('ArrowDown');
  activeRadio = configurationGroup.locator('[role="radio"][tabindex="0"]');
  await expect(activeRadio).toBeFocused();
  await expect(activeRadio).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  const budgetGroup = page.getByRole('radiogroup', { name: 'تفضيل الميزانية' });
  activeRadio = budgetGroup.locator('[role="radio"][tabindex="0"]');
  await activeRadio.focus();
  await page.keyboard.press('ArrowDown');
  activeRadio = budgetGroup.locator('[role="radio"][tabindex="0"]');
  await expect(activeRadio).toBeFocused();
  await expect(activeRadio).toHaveAttribute('aria-checked', 'true');
});

test('supports keyboard activation, visible focus, and RTL/LTR semantics', async ({ page }) => {
  await openWorkspace(page);
  const discover = page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ });
  await discover.focus();
  await expect(discover).toBeFocused();
  const outline = await discover.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-mode', 'discover');
  const firstOption = page.getByRole('radio', { name: /فهم عملي وخدماتي/ });
  await firstOption.focus();
  await page.keyboard.press('Space');
  await expect(firstOption).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('dir', 'rtl');
  const inheritedDirection = await page.locator('.gsdw-eyebrow').first().evaluate((element) => getComputedStyle(element).direction);
  expect(inheritedDirection).toBe('rtl');
  await expect(page.locator('[dir="ltr"]').first()).toBeVisible();
});

test('keeps semantic decision metadata readable and contrast-safe on desktop and mobile', async ({ page }) => {
  for (const [width, height] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await reachSummary(page);
    const selectors = [
      '.gsdw-summary-row > div:first-child em',
      '.gsdw-summary-row li > span',
      '.gsdw-summary-capabilities small',
      '.gsdw-evidence > strong',
    ];

    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      await expect(locator).toBeVisible();
      const metrics = await locator.evaluate((element) => {
        const parseRgb = (value: string) => {
          const parts = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
          return parts.map((part) => part / 255);
        };
        const luminance = (rgb: number[]) => {
          const linear = rgb.map((channel) =>
            channel <= 0.04045
              ? channel / 12.92
              : ((channel + 0.055) / 1.055) ** 2.4,
          );
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        };
        const style = getComputedStyle(element);
        let backgroundElement: Element | null = element;
        let backgroundColor = 'rgb(7, 16, 21)';
        while (backgroundElement) {
          const candidate = getComputedStyle(backgroundElement).backgroundColor;
          if (candidate && candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') {
            backgroundColor = candidate;
            break;
          }
          backgroundElement = backgroundElement.parentElement;
        }
        const foreground = luminance(parseRgb(style.color));
        const background = luminance(parseRgb(backgroundColor));
        return {
          fontSize: Number.parseFloat(style.fontSize),
          contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
        };
      });
      expect(metrics.fontSize).toBeGreaterThanOrEqual(8);
      expect(metrics.contrast).toBeGreaterThanOrEqual(4.5);
    }
  }
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`captures entry evidence and has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
    await openWorkspace(page);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, `entry-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}

test('captures desktop and mobile decision-summary evidence without overflow', async ({ page }) => {
  for (const [width, height] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await reachSummary(page);
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, `summary-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    await page.getByRole('button', { name: 'تغيير نقطة البداية' }).click();
  }
});
