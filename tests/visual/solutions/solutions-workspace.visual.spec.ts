import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

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
    await page.getByRole('button', { name: 'تغيير نقطة البداية' }).click();
    await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'entry');
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

test('Finder progresses one useful question at a time and explains its bounded recommendation', async ({ page }) => {
  await reachPortalRecommendation(page);
  await expect(page.getByText('اتجاه أولي قابل للمراجعة')).toBeVisible();
  await expect(page.getByText('عمق التشغيل: أنظمة أو تكاملات مهمة')).toBeVisible();
  await expect(page.getByText('المعلومات الناقصة لا تخفض «نسبة تطابق»')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الحجوزات والخدمات' })).toBeVisible();
});

test('supports bounded comparison and preserves an alternative direction', async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole('button', { name: /أريد مقارنة الخيارات/ }).click();
  await page.getByRole('button', { name: /التجارة الرقمية وتجارب العلامات/ }).click();
  await page.getByRole('button', { name: /الأنظمة التشغيلية والبوابات/ }).click();
  await expect(page.getByLabel('مقارنة اتجاهي الحل')).toBeVisible();
  await page.getByRole('button', { name: /اعتماد التجارة الرقمية وتجارب العلامات/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-family', 'commerce');
  await expect(page.getByText('اتجاه بديل يستحق النظر')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الأنظمة التشغيلية والبوابات' })).toBeVisible();
});

test('configures contextual capabilities, option depth, budget, dependencies, and summary', async ({ page }) => {
  await reachSummary(page);
  await expect(page.getByText('تكاملات وهوية وصلاحيات متقدمة', { exact: true })).toBeVisible();
  await expect(page.getByText('مرونة حسب القيمة', { exact: true })).toBeVisible();
  await expect(page.getByText('نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات')).toBeVisible();
  await expect(page.locator('.gsdw-summary-row[data-kind="unknown"]')).toHaveCount(1);
  await expect(page.getByText('REFERENCE_ONLY', { exact: true })).toBeVisible();
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

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`captures entry evidence and has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
    await openWorkspace(page);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
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
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    await page.screenshot({
      path: resolve(EVIDENCE_DIR, `summary-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    await page.getByRole('button', { name: 'تغيير نقطة البداية' }).click();
  }
});
