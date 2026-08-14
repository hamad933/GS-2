import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  buildDiscoverySummary,
  createStartDiscoveryDraft,
  formatDiscoverySummary,
  getDiscoverySteps,
} from '../../../src/features/start-discovery/discoveryModel';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';

const previewPath = './';
const evidenceDirectory = resolve(
  process.env.START_DISCOVERY_EVIDENCE_DIR ??
    'test-results/start-discovery-evidence',
);

const certaintyCases = [
  {
    label: 'لا أعرف ماذا أحتاج',
    value: 'exploring',
    steps: [
      'نقطة البداية',
      'بوصلة المشروع',
      'الاستخدام والنتيجة',
      'تفضيلات وحدود',
      'ملخص الاكتشاف',
    ],
  },
  {
    label: 'لدي اتجاه عام',
    value: 'direction',
    steps: [
      'نقطة البداية',
      'بوصلة المشروع',
      'الاستخدام والنتيجة',
      'شكل الحل',
      'تفضيلات وحدود',
      'ملخص الاكتشاف',
    ],
  },
  {
    label: 'اخترت حلًا أو إعدادًا مبدئيًا',
    value: 'configured',
    steps: [
      'نقطة البداية',
      'بوصلة المشروع',
      'شكل الحل',
      'الواقع المحيط',
      'تفضيلات وحدود',
      'ملخص الاكتشاف',
    ],
  },
  {
    label: 'أعرف معظم متطلباتي',
    value: 'detailed',
    steps: [
      'نقطة البداية',
      'بوصلة المشروع',
      'الاستخدام والنتيجة',
      'شكل الحل',
      'الواقع المحيط',
      'تفضيلات وحدود',
      'ملخص الاكتشاف',
    ],
  },
] as const;

async function openDiscovery(page: Page, query = '') {
  await page.goto(`${previewPath}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.start-discovery')).toBeVisible();
}

async function chooseCertainty(page: Page, label: string) {
  await page.getByRole('radio', { name: new RegExp(label) }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute(
    'data-step',
    'foundation',
  );
}

async function completeFoundation(page: Page, problem = 'الطلبات موزعة ولا تظهر حالتها بوضوح.') {
  await page.getByRole('button', { name: 'تحسين عملية تشغيلية' }).click();
  await page.getByLabel('المشكلة الحالية').fill(problem);
  await page.getByRole('button', { name: 'متابعة' }).click();
}

async function reachSummary(page: Page) {
  while ((await page.locator('.start-discovery').getAttribute('data-step')) !== 'summary') {
    const step = await page.locator('.start-discovery').getAttribute('data-step');
    if (step === 'configuration') {
      const family = page.getByLabel('الحل أو العائلة المقترحة');
      if (!(await family.inputValue())) await family.fill('بوابة تشغيلية مبدئية');
    }
    await page.locator('.sd-next').click();
  }
  await expect(page.getByRole('heading', { name: 'ملخص الاكتشاف الأولي' })).toBeVisible();
}

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true });
});

test('prefill adapter maps future Solutions context without coupling', () => {
  const draft = createStartDiscoveryDraft(
    {
      version: START_DISCOVERY_PREFILL_VERSION,
      source: {
        adapter: 'solutions-decision-workspace',
        label: 'مساحة قرار الحلول',
        referenceId: 'decision-42',
      },
      selectedProblem: 'مشكلة مختارة',
      selectedOutcome: 'نتيجة مختارة',
      recommendedFamily: 'عائلة موصى بها',
      selectedCapabilities: ['بحث', 'بحث', 'حجز'],
      optionalCapabilities: ['تقارير'],
      configurationPreference: 'بداية محدودة',
      budgetPreference: 'أفضل تحديد النطاق أولًا',
      knownDependencies: ['مصدر بيانات'],
      unknowns: ['مالك القرار'],
      relevantReferenceContext: 'مرجع ذو صلة',
    },
    'configured',
  );

  expect(draft.currentProblem).toBe('مشكلة مختارة');
  expect(draft.objective).toBe('نتيجة مختارة');
  expect(draft.selectedCapabilities).toEqual(['بحث', 'حجز']);
  expect(draft.prefillSource?.referenceId).toBe('decision-42');

  const summary = buildDiscoverySummary(draft);
  expect(summary.groups.map((group) => group.status)).toEqual([
    'known',
    'selected',
    'preferred',
    'dependent',
    'unknown',
  ]);
  expect(formatDiscoverySummary(summary)).toContain('UNKNOWN / NEEDS DISCOVERY');
});

test('all four certainty conditions produce distinct progressive paths', async ({ page }) => {
  for (const certaintyCase of certaintyCases) {
    await openDiscovery(page);
    await page
      .getByRole('radio', { name: new RegExp(certaintyCase.label) })
      .click();
    await expect(page.locator('.start-discovery')).toHaveAttribute(
      'data-certainty',
      certaintyCase.value,
    );
    await expect(page.locator('.sd-context nav li')).toHaveCount(
      certaintyCase.steps.length,
    );
    await expect(page.locator('.sd-context nav li span')).toHaveText(
      certaintyCase.steps,
    );
  }

  expect(getDiscoverySteps('exploring')).not.toContain('configuration');
  expect(getDiscoverySteps('detailed')).toContain('dependencies');
});

test('required fields block progress and focus the first invalid control', async ({ page }) => {
  await openDiscovery(page);
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByRole('alert')).toContainText('اختر العبارة الأقرب');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-step', 'certainty');

  await chooseCertainty(page, 'لا أعرف ماذا أحتاج');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByText('حدد هدفًا رئيسيًا للمشروع.')).toBeVisible();
  await expect(page.getByText('صف المشكلة الحالية بجملة واحدة على الأقل.')).toBeVisible();
  await expect(page.getByLabel('الهدف الرئيسي بصياغتك')).toBeFocused();
});

test('short exploring branch permits optional fields and reaches review before completion', async ({ page }) => {
  await openDiscovery(page);
  await chooseCertainty(page, 'لا أعرف ماذا أحتاج');
  await completeFoundation(page);
  await expect(page.locator('.start-discovery')).toHaveAttribute(
    'data-step',
    'people-outcomes',
  );
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute(
    'data-step',
    'preferences',
  );
  await page.getByRole('button', { name: 'مراجعة الملخص' }).click();

  await expect(page.locator('.start-discovery')).toHaveAttribute('data-step', 'summary');
  await expect(page.getByText('هذا الملخص يتغير فور تعديل قراراتك.')).toBeVisible();
  await expect(page.getByText('لم تُرسل البيانات ولم تُحفظ في خادم.')).toBeVisible();
  await expect(page.getByText('شكل الحل والقدرات المناسبة')).toBeVisible();
});

test('detailed path preserves selected, dependent, and unknown data through edit and revisit', async ({ page }) => {
  await openDiscovery(page);
  await chooseCertainty(page, 'أعرف معظم متطلباتي');
  await completeFoundation(page, 'الوضع القديم يحتاج تنظيمًا.');
  await page.getByLabel('المستخدمون المقصودون').fill('فريق العمليات');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByLabel('الحل أو العائلة المقترحة').fill('بوابة تشغيلية');
  await page
    .getByLabel('قدرات حُسمت مبدئيًا')
    .fill('استقبال الطلبات\nمتابعة الحالة');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page.getByLabel('تكاملات تحتاج تحققًا').fill('نظام داخلي غير مفحوص');
  await page.getByRole('button', { name: 'متابعة' }).click();
  await page
    .getByLabel('أسئلة أو مجهولات نحتاج لاكتشافها')
    .fill('جاهزية البيانات');
  await page.getByRole('button', { name: 'مراجعة الملخص' }).click();

  await expect(page.locator('[data-summary-status="selected"]')).toContainText(
    'استقبال الطلبات',
  );
  await expect(page.locator('[data-summary-status="dependent"]')).toContainText(
    'نظام داخلي غير مفحوص',
  );
  await expect(page.locator('[data-summary-status="unknown"]')).toContainText(
    'جاهزية البيانات',
  );

  await page.getByRole('button', { name: 'تعديل قسم معلوم' }).click();
  await page.getByLabel('المشكلة الحالية').fill('الوضع المحدّث يحتاج تنظيمًا.');
  await page.getByRole('button', { name: 'حفظ والعودة إلى الملخص' }).click();
  await expect(page.locator('[data-summary-status="known"]')).toContainText(
    'الوضع المحدّث يحتاج تنظيمًا.',
  );
  await expect(page.locator('[data-summary-status="known"]')).not.toContainText(
    'الوضع القديم يحتاج تنظيمًا.',
  );
});

test('prefilled context remains reviewable and visibly classified', async ({ page }) => {
  await openDiscovery(page, '?prefill=1&certainty=configured');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.getByText('تم حمل سياق سابق إلى هذه الصفحة.')).toBeVisible();
  await expect(page.getByText('SDW-DEMO-04')).toBeVisible();
  await expect(page.getByLabel('الهدف الرئيسي بصياغتك')).toHaveValue(
    'توحيد رحلة الطلب ومتابعة حالته من نقطة واحدة.',
  );
  await page.getByRole('button', { name: '01 نقطة البداية' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-step', 'certainty');
  await page.getByRole('button', { name: '02 بوصلة المشروع' }).click();
  await page.getByRole('button', { name: 'متابعة' }).click();
  await expect(page.getByLabel('قدرات حُسمت مبدئيًا')).toHaveValue(
    /استقبال الطلبات/,
  );
  await reachSummary(page);

  for (const status of ['known', 'selected', 'preferred', 'dependent', 'unknown']) {
    await expect(page.locator(`[data-summary-status="${status}"]`)).toBeVisible();
  }
  await expect(page.locator('[data-summary-status="selected"]')).toContainText(
    'متابعة الحالة',
  );
  await expect(page.locator('[data-summary-status="preferred"]')).toContainText(
    'الأنظمة التشغيلية والبوابات',
  );
  await expect(page.locator('[data-summary-status="dependent"]')).toContainText(
    'مراجعة مصدر بيانات الطلبات الحالي',
  );
});

test('local completion never claims remote submission and can return to review', async ({ page }) => {
  await openDiscovery(page);
  await chooseCertainty(page, 'لا أعرف ماذا أحتاج');
  await completeFoundation(page);
  await reachSummary(page);
  await page.getByRole('button', { name: 'تثبيت نسخة المراجعة' }).click();

  await expect(page.locator('.start-discovery')).toHaveAttribute('data-step', 'complete');
  await expect(page.getByText('تم تثبيت نسخة المراجعة محليًا.')).toBeVisible();
  await expect(page.getByText('Your project has been submitted')).toHaveCount(0);
  await expect(page.getByText('تم إرسال مشروعك')).toHaveCount(0);
  await page.getByRole('button', { name: 'العودة إلى الملخص' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-step', 'summary');
});

test('keyboard activation, focus transfer, and auto LTR input work', async ({ page }) => {
  await openDiscovery(page);
  const option = page.getByRole('radio', { name: /لدي اتجاه عام/ });
  await option.focus();
  await expect(option).toBeFocused();
  await page.keyboard.press('Space');
  await expect(option).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'متابعة' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'ما الذي يستحق أن يتغيّر؟' })).toBeFocused();

  const objective = page.getByLabel('الهدف الرئيسي بصياغتك');
  await objective.fill('Improve service intake');
  await expect(objective).toHaveCSS('direction', 'ltr');
  await objective.focus();
  await expect(objective).toBeFocused();
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`renders without horizontal overflow, console errors, or page errors at ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setViewportSize({
      width,
      height: width >= 1024 ? 900 : width === 768 ? 1024 : 844,
    });
    await openDiscovery(page);
    await page.getByRole('radio', { name: /لدي اتجاه عام/ }).click();
    await page.getByRole('button', { name: 'متابعة' }).click();
    const dimensions = await page.evaluate(() => {
      const discovery = document.querySelector('.start-discovery');
      if (!discovery) throw new Error('Start / Discovery root is missing');
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        rootDirection: getComputedStyle(discovery).direction,
      };
    });

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    expect(dimensions.rootDirection).toBe('rtl');
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    await page.screenshot({
      path: resolve(evidenceDirectory, `start-discovery-${width}-foundation.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}

test('captures prefilled summary evidence at desktop and one-handed mobile widths', async ({ page }) => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await openDiscovery(page, '?prefill=1&certainty=configured');
    await page.getByRole('button', { name: 'متابعة' }).click();
    await reachSummary(page);
    await page.screenshot({
      path: resolve(evidenceDirectory, `start-discovery-${width}-prefilled-summary.png`),
      fullPage: true,
      animations: 'disabled',
    });
  }
});
