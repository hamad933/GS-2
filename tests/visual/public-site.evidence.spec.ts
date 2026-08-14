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
