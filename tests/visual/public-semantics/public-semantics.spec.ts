import { expect, test, type Page } from '@playwright/test';
import { referenceProjects } from '../../../src/data/reference-projects';
import { solutionFamilies } from '../../../src/data/solutions';

const WORKSPACE = '#solutions-decision-workspace';
const REFERENCE_BODY = '.reference-projects-body';
const runtimeErrors = new WeakMap<Page, string[]>();

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

async function chooseFinderOption(page: Page, name: string) {
  await page.getByRole('radio', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: /السؤال التالي/ }).click();
}

async function reachDecisionSummary(page: Page) {
  await open(page, '/solutions');
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  await chooseFinderOption(page, 'تنظيم عمل وطلبات داخلية');
  await chooseFinderOption(page, 'عمليات وفرق');
  await chooseFinderOption(page, 'فريق داخلي');
  await page.getByRole('radio', { name: /أنظمة أو تكاملات مهمة/ }).click();
  await page.getByPlaceholder(/نظام قائم/).fill('نظام داخلي قائم يحتاج تحققًا تقنيًا');
  await page.getByRole('button', { name: /بناء الاتجاه/ }).click();
  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
  await page.getByRole('button', { name: /تكاملات وهوية وصلاحيات متقدمة/ }).click();
  await page.getByRole('button', { name: /مقارنة اتجاه التكوين/ }).click();
  await page.getByRole('radio', { name: /ربط عدة مسارات مترابطة/ }).click();
  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  await page.getByRole('radio', { name: /مرونة حسب القيمة/ }).click();
  await page.getByPlaceholder('اكتب النطاق أو القيد بصيغتك').fill('قيد مالي يحدده صاحب القرار');
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

test('preserves the six solution families and the bounded capability classifications', () => {
  expect(solutionFamilies).toHaveLength(6);
  expect(solutionFamilies.map((family) => family.id)).toEqual([
    'business',
    'commerce',
    'booking',
    'assets',
    'portals',
    'knowledge',
  ]);

  const classifications = new Set(
    solutionFamilies.flatMap((family) => family.capabilities.map((capability) => capability.classification)),
  );
  expect([...classifications].sort()).toEqual(['CONDITIONAL', 'CORE', 'CUSTOM', 'OPTIONAL', 'RECOMMENDED']);
  expect(solutionFamilies.flatMap((family) => family.capabilities).every((capability) => !('id' in capability))).toBe(true);
});

test('preserves exact RP identities, independent state, and absent outbound routes', () => {
  expect(referenceProjects.map((project) => `${project.code} — ${project.name} / ${project.domain.en}`)).toEqual([
    'RP01 — Bayt & Style / Commerce & Fulfillment',
    'RP02 — Enterprise Operations & Control / Enterprise Operations & Control',
    'RP03 — Booking & Service Operations / Booking & Service Operations',
    'RP04 — Real Estate & Asset Lifecycle / Real Estate & Asset Lifecycle',
  ]);
  expect(referenceProjects.every((project) => project.outboundRoute === null)).toBe(true);
  expect(referenceProjects.every((project) => (
    project.evidence.map((item) => item.state).join(',') === 'REFERENCE_ONLY,UNAVAILABLE,UNAVAILABLE'
  ))).toBe(true);
});

test('renders localized Arabic truth first while retaining machine state as secondary metadata', async ({ page }) => {
  await open(page, '/reference-projects');
  await expect(page.locator(REFERENCE_BODY)).toHaveAttribute('dir', 'rtl');

  for (const projectId of ['rp01', 'rp02', 'rp03', 'rp04']) {
    await page.locator(`[data-project-selector="${projectId}"]`).click();
    const toggle = page.getByRole('button', { name: /سجل الحدود والتحقق/ });
    await toggle.click();
    await expect(page.locator('.rp-ledger__evidence .rp-state-label[data-state="REFERENCE_ONLY"] > strong')).toHaveText('مرجع سياقي فقط');
    await expect(page.locator('.rp-ledger__evidence .rp-state-label[data-state="UNAVAILABLE"] > strong')).toHaveText([
      'الدليل غير متاح',
      'الدليل غير متاح',
    ]);
    await expect(page.locator('.rp-ledger__route .rp-state-label[data-state="ROUTE_NOT_CONFIGURED"] > strong')).toHaveText('الرابط المرجعي غير مهيأ بعد');
  }

  await expect(page.locator('.rp-state-label > strong').filter({ hasText: /^ROUTE_NOT_CONFIGURED$/ })).toHaveCount(0);
  await expect(page.locator('.rp-state-label > small').filter({ hasText: /^ROUTE_NOT_CONFIGURED$/ }).first()).toBeVisible();
  await expect(page.locator(`${REFERENCE_BODY} a[href]`)).toHaveCount(0);

  const hierarchy = await page.locator('.rp-ledger__route .rp-state-label').evaluate((label) => {
    const primary = label.querySelector('strong');
    const technical = label.querySelector('small');
    return {
      primary: primary ? Number.parseFloat(getComputedStyle(primary).fontSize) : 0,
      technical: technical ? Number.parseFloat(getComputedStyle(technical).fontSize) : 0,
    };
  });
  expect(hierarchy.primary).toBeGreaterThan(hierarchy.technical);
});

test('renders natural English labels and preserves LTR identifiers', async ({ page }) => {
  await open(page, '/tests/visual/fixtures/reference-projects/index.html?locale=en');
  await expect(page.locator(REFERENCE_BODY)).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('[data-project-selector="rp02"]')).toContainText('Enterprise Operations & Control');
  await page.locator('[data-project-selector="rp02"]').click();
  await page.getByRole('button', { name: /boundaries and verification ledger/i }).click();
  await expect(page.locator('.rp-state-label[data-state="REFERENCE_ONLY"] > strong').first()).toHaveText('Contextual reference only');
  await expect(page.locator('.rp-state-label[data-state="UNAVAILABLE"] > strong').first()).toHaveText('Evidence unavailable');
  await expect(page.locator('.rp-ledger__route .rp-state-label > strong')).toHaveText('Reference route not configured yet');
  await expect(page.locator('.rp-project-selector__code').first()).toHaveCSS('direction', 'ltr');
});

test('separates customer facts, system direction, current configuration, unknowns, and evidence truth', async ({ page }) => {
  await reachDecisionSummary(page);

  await expect(page.getByLabel('مفتاح أنواع المعلومات')).toContainText('معلومات قدّمتها');
  await expect(page.getByLabel('مفتاح أنواع المعلومات')).toContainText('توصية النظام / الاتجاه الحالي');
  await expect(page.getByLabel('مفتاح أنواع المعلومات')).toContainText('التكوين الحالي');
  await expect(page.getByLabel('مفتاح أنواع المعلومات')).toContainText('يحتاج اكتشافًا');

  await expect(page.locator('.gsdw-summary-row[data-kind="fact"]')).not.toHaveCount(0);
  await expect(page.locator('.gsdw-summary-row[data-kind="recommendation"]')).not.toHaveCount(0);
  await expect(page.locator('.gsdw-summary-row[data-kind="configuration"]')).not.toHaveCount(0);
  await expect(page.locator('.gsdw-summary-row[data-kind="unknown"]')).toHaveCount(1);
  await expect(page.locator('.gsdw-summary-row[data-kind="evidence"]')).toHaveCount(1);
  await expect(page.getByText('توصية النظام الحاسمة من المدخلات المتاحة', { exact: true })).toBeVisible();

  const capabilities = page.locator('.gsdw-summary-capabilities');
  await expect(page.locator('.gsdw-summary-row[data-kind="configuration"]').filter({ has: capabilities })).toContainText('تُعرض كل قدرة مع مصدر إدراجها');
  const core = capabilities.locator('[data-classification="CORE"]').first();
  const recommended = capabilities.locator('[data-classification="RECOMMENDED"]').first();
  const custom = capabilities.locator('[data-classification="CUSTOM"]').first();
  await expect(core).toHaveAttribute('data-provenance', 'SYSTEM_SEEDED');
  await expect(recommended).toHaveAttribute('data-provenance', 'SYSTEM_SEEDED');
  await expect(custom).toHaveAttribute('data-provenance', 'USER_SELECTED');
  await expect(core).toContainText('مدرجة مبدئيًا من النظام');
  await expect(custom).toContainText('اخترتها أنت');
  await expect(page.locator('.gsdw-summary-row').filter({ hasText: 'قيد أو تفضيل الميزانية' })).toContainText('قيد مالي يحدده صاحب القرار');
  await expect(page.getByText(/سعرًا أو تقييم ملاءمة مالية/)).toBeVisible();

  await expect(page.locator('.gsdw-evidence > strong')).toHaveText('مرجع سياقي فقط');
  await expect(page.locator(`${WORKSPACE} .gsdw-evidence > small`)).toHaveCount(0);
  await expect(page.locator(WORKSPACE).getByText('REFERENCE_ONLY', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/\b(?:399|387)\b/)).toHaveCount(0);
});

test('keeps the Solutions to Start handoff truthful and capability provenance explicit', async ({ page }) => {
  await reachDecisionSummary(page);
  await page.getByRole('button', { name: /تجهيز الانتقال إلى Discovery/ }).click();

  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.getByLabel('الهدف الرئيسي بصياغتك')).toHaveValue('');
  const carriedFacts = page.locator('[data-carried-facts="true"]');
  await expect(carriedFacts).toContainText('النتيجة: تنظيم عمل وطلبات داخلية');
  await expect(carriedFacts).toContainText('النشاط: عمليات وفرق');
  await expect(carriedFacts).toContainText('الجمهور: فريق داخلي');
  await expect(carriedFacts).toContainText('العمق: أنظمة أو تكاملات مهمة');
  await expect(carriedFacts).toContainText('القيد: نظام داخلي قائم يحتاج تحققًا تقنيًا');

  await page.getByLabel('الهدف الرئيسي بصياغتك').fill('تنظيم بوابة تشغيلية موحدة');
  await page.getByLabel('المشكلة الحالية').fill('الطلبات موزعة وتحتاج حالة تشغيل مشتركة.');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByLabel('الحل أو العائلة المقترحة')).toHaveValue('الأنظمة التشغيلية والبوابات');
  await expect(page.getByLabel('قدرات حُسمت مبدئيًا')).toHaveValue(/تكاملات وهوية وصلاحيات متقدمة/);
  await expect(page.getByLabel('قدرات حُسمت مبدئيًا')).not.toHaveValue(/نمذجة الطلب والحالة/);
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByLabel('تبعيات معروفة')).toHaveValue(/عملية تشغيل قابلة للوصف/);
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.locator('[data-carried-prefill="true"]')).toContainText('قيد مالي يحدده صاحب القرار');
  await page.getByRole('button', { name: 'مراجعة الملخص' }).click();
  await expect(page.locator('[data-summary-status="known"]')).toContainText('تنظيم عمل وطلبات داخلية');
  await expect(page.locator('[data-summary-status="known"]')).toContainText('عمليات وفرق');
  await expect(page.locator('[data-summary-status="preferred"]')).toContainText('نمذجة الطلب والحالة — أساسي من النظام');
  await expect(page.locator('.start-discovery').getByText('REFERENCE_ONLY', { exact: true })).toHaveCount(0);
});

test('preserves keyboard focus and deliberate RTL/LTR direction', async ({ page }) => {
  await open(page, '/reference-projects');
  const first = page.locator('[data-project-selector="rp01"]');
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-project-selector="rp02"]')).toBeFocused();
  await expect(page.locator(REFERENCE_BODY)).toHaveAttribute('data-active-project', 'rp02');
  await expect(page.locator('.rp-project-selector__code').first()).toHaveCSS('direction', 'ltr');
  await expect(page.locator('[data-project-selector="rp02"]')).toHaveCSS('outline-style', 'solid');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`has no overflow or runtime errors in public semantic states at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 900 });
    await open(page, '/reference-projects');
    await page.locator('[data-project-selector="rp04"]').click();
    await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
    await expectNoHorizontalOverflow(page);

    await open(page, '/solutions');
    await expect(page.locator(WORKSPACE)).toHaveAttribute('dir', 'rtl');
    await expectNoHorizontalOverflow(page);
  });
}
