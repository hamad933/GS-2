import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const evidenceDirectory = resolve(
  process.env.W05_EVIDENCE_DIR ?? 'test-results/w05-public-site-evidence',
);
const workspace = '#solutions-decision-workspace';

const routes = [
  { slug: 'home', path: '/', ready: '#hero' },
  { slug: 'solutions-entry', path: '/solutions', ready: '#gsdw-entry-title' },
  { slug: 'reference-projects', path: '/reference-projects', ready: '#reference-projects-title' },
  { slug: 'how-we-work', path: '/how-we-work', ready: '#how-we-work-title' },
  { slug: 'start-direct', path: '/start', ready: '#start-discovery-title' },
  { slug: '404', path: '/nonexistent-route', ready: '[data-route-focus]' },
] as const;

test.beforeAll(async () => {
  await mkdir(evidenceDirectory, { recursive: true });
});

async function open(page: Page, path: string, ready: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(ready).first()).toBeVisible();
}

async function capture(page: Page, name: string, fullPage = true) {
  await page.screenshot({
    path: resolve(evidenceDirectory, name),
    fullPage,
    animations: 'disabled',
    style: '.skip-link { visibility: hidden !important; }',
  });
}

async function reachStartRecommendation(page: Page) {
  await page.goto('/start');
  await page.evaluate(() => window.sessionStorage.removeItem('gs-start-frozen-product-v1'));
  await open(page, '/start', '#start-discovery-title');
  await page.getByRole('radio', { name: /ساعدني على اكتشاف ما أحتاج/ }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
  await page.getByLabel('ما الذي تريد تغييره؟').fill('أريد تنظيم الحجز والمواعيد للعملاء');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء وفريق الخدمة');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('رحلة حجز أوضح بخطوات أقل');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما السياق التشغيلي الذي يجب أن نعرفه؟').fill('خدمة بمواعيد يديرها فريق داخلي');
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
}

async function reachMeaningfulStartBuild(page: Page) {
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await page.locator('.sfp-decision [role="radio"]').first().click();
  const support = page.locator('.sfp-build-support');
  const wasOpen = await support.evaluate((element: HTMLDetailsElement) => element.open);
  if (!wasOpen) await support.locator('summary').click();
  await page.locator('.sfp-experience [role="radio"]').first().click();
  if (!wasOpen) await support.locator('summary').click();
  await expect(page.locator('[data-testid="decision-consequence"]')).toBeVisible();
}

async function reachStartFamilyBuild(page: Page, familyName: RegExp) {
  await reachStartRecommendation(page);
  await page.getByText('قارن أو اختر اتجاهًا آخر').click();
  await page.getByRole('button', { name: familyName }).click();
  await page.getByRole('button', { name: /تابع مع اختيارك/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
}

async function expectR4MobileBuildOrder(page: Page) {
  await expect(page.locator('[data-testid="project-pulse"]')).toHaveCount(1);
  await expect(page.locator('.sfp-build-support summary')).toBeVisible();
  const state = await page.evaluate(() => {
    const position = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      if (!rect) throw new Error(`Missing R4 evidence selector: ${selector}`);
      return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
    };
    return {
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      consequence: position('[data-testid="decision-consequence"]'),
      pulse: position('[data-testid="project-pulse"]'),
      action: position('.sfp-build-actions'),
      support: position('.sfp-build-support'),
    };
  });
  expect(state.scrollWidth).toBeLessThanOrEqual(state.width + 1);
  expect(state.pulse.top).toBeGreaterThanOrEqual(state.consequence.bottom - 1);
  expect(state.action.top).toBeGreaterThanOrEqual(state.pulse.bottom - 1);
  expect(state.support.top).toBeGreaterThanOrEqual(state.action.bottom - 1);
}

async function finishStartBuild(page: Page) {
  while ((await page.locator('.start-discovery').getAttribute('data-stage')) === 'build') {
    const decision = page.locator('.sfp-decision [role="radio"]').first();
    if (await decision.count()) await decision.click();
    await page.getByRole('button', { name: /تابع في الرحلة|احفظ التكوين وتابع/ }).click();
  }
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
  await expect(page.locator('[data-testid="project-blueprint"]')).toBeVisible();
}

async function chooseFinderOption(page: Page, name: string, last = false) {
  await page.getByRole('radio', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: last ? /بناء الاتجاه/ : /السؤال التالي/ }).click();
}

async function reachPortalRecommendation(page: Page) {
  await open(page, '/solutions', '#gsdw-entry-title');
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  await chooseFinderOption(page, 'تنظيم عمل وطلبات داخلية');
  await chooseFinderOption(page, 'عمليات وفرق');
  await chooseFinderOption(page, 'فريق داخلي');
  await page.getByRole('radio', { name: /أنظمة أو تكاملات مهمة/ }).click();
  await page.getByPlaceholder(/نظام قائم/).fill('نظام داخلي قائم يحتاج تحققًا تقنيًا');
  await page.getByRole('button', { name: /بناء الاتجاه/ }).click();
  await expect(page.locator(workspace)).toHaveAttribute('data-family', 'portals');
}

async function configureDecision(page: Page) {
  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
  await page.getByRole('button', { name: /تكاملات وهوية وصلاحيات متقدمة/ }).click();
  await page.getByRole('button', { name: /مقارنة اتجاه التكوين/ }).click();
  await page.getByRole('radio', { name: /ربط عدة مسارات مترابطة/ }).click();
  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  await page.getByRole('radio', { name: /مرونة حسب القيمة/ }).click();
  await page.getByPlaceholder('اكتب النطاق أو القيد بصيغتك').fill(
    'نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات',
  );
  await page.getByText('عملية تشغيل قابلة للوصف', { exact: true }).click();
}

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`captures integrated route matrix at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({
      width,
      height: width === 768 ? 1024 : width <= 430 ? 844 : 900,
    });
    for (const route of routes) {
      await open(page, route.path, route.ready);
      await capture(page, `w05-${width}-${route.slug}.png`);
    }
  });
}

for (const [width, height] of [[1440, 900], [390, 844]] as const) {
  test(`captures critical decision and handoff states at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height });
    await reachPortalRecommendation(page);
    await capture(page, `w05-${width}-solutions-recommendation.png`);

    await configureDecision(page);
    await capture(page, `w05-${width}-solutions-configuration.png`);
    await page.getByRole('button', { name: /إنتاج ملخص القرار/ }).click();
    await expect(page.locator(workspace)).toHaveAttribute('data-step', 'summary');
    await capture(page, `w05-${width}-solutions-decision-summary.png`);

    await page.getByRole('button', { name: /تجهيز الانتقال إلى Discovery/ }).click();
    await expect(page).toHaveURL(/\/start$/);
    await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
    await capture(page, `w05-${width}-start-solutions-prefill.png`);
  });
}

for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]] as const) {
  test(`captures integrated START R3 decision states at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height });
    await reachStartRecommendation(page);
    await capture(page, `w01-r3-${width}-start-discover.png`);

    await reachMeaningfulStartBuild(page);
    await capture(page, `w01-r3-${width}-start-build.png`);

    await finishStartBuild(page);
    await capture(page, `w01-r3-${width}-start-review.png`);
  });
}

for (const [width, height] of [[430, 932], [390, 844]] as const) {
  test(`captures integrated START R4 mobile Build closure at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height });
    await reachStartRecommendation(page);
    await reachMeaningfulStartBuild(page);
    await expectR4MobileBuildOrder(page);
    await capture(page, `w01-r4-${width}-start-build.png`);
  });
}

test('captures integrated START R4 approved FAM-05 and FAM-06 contextual evidence', async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 430, height: 932 });

  await reachStartFamilyBuild(page, /الأنظمة التشغيلية والبوابات/);
  await page.locator('.sfp-build-support summary').click();
  await page.getByRole('button', { name: /شاهد مثالًا مرتبطًا/ }).click();
  const fam05Dialog = page.getByRole('dialog');
  await expect(fam05Dialog.locator('img[data-asset-id="FAM-05-CTX-01"]')).toHaveAttribute('data-asset-status', 'approved-bound');
  await fam05Dialog.screenshot({ path: resolve(evidenceDirectory, 'w01-r4-fam05-context.png'), animations: 'disabled' });

  await reachStartFamilyBuild(page, /التعليم والمعرفة والمحتوى/);
  await page.locator('.sfp-build-support summary').click();
  await page.getByRole('button', { name: /شاهد مثالًا مرتبطًا/ }).click();
  const fam06Dialog = page.getByRole('dialog');
  await expect(fam06Dialog.locator('img[data-asset-id="FAM-06-CTX-01"]')).toHaveAttribute('data-asset-status', 'approved-bound');
  await fam06Dialog.screenshot({ path: resolve(evidenceDirectory, 'w01-r4-fam06-context.png'), animations: 'disabled' });
});

test('captures mobile navigation and expanded reference boundary', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/solutions', '#gsdw-entry-title');
  await page.getByRole('button', { name: 'فتح قائمة التنقل' }).click();
  await capture(page, 'w05-390-mobile-navigation.png', false);

  await open(page, '/reference-projects', '#reference-projects-title');
  await page.locator('[data-project-selector="rp04"]').click();
  await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
  await capture(page, 'w05-390-reference-projects-rp04-boundary.png');
});
