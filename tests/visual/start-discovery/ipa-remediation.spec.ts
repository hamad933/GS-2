import { expect, test, type Page } from '@playwright/test';
import { assessStartRecommendation } from '../../../src/data/start-discovery/startExperience';

const previewPath = './';

async function openStart(page: Page, query = '') {
  await page.goto(previewPath);
  await page.evaluate(() => window.sessionStorage.removeItem('gs-start-frozen-product-v1'));
  await page.goto(`${previewPath}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.start-discovery')).toBeVisible();
}

async function enterDirectQuestions(page: Page) {
  await openStart(page);
  await page.getByRole('radio', { name: /ساعدني على اكتشاف ما أحتاج/ }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
}

async function reachBookingPayment(page: Page) {
  await openStart(page, '?prefill=booking');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await expect(page.getByRole('heading', { name: 'هل تريد تحصيل مبلغ عند الحجز؟' })).toBeVisible();
}

async function finishBookingBuild(page: Page) {
  while ((await page.locator('.start-discovery').getAttribute('data-stage')) === 'build') {
    const decision = page.locator('.sfp-decision [role="radio"]').first();
    if (await decision.count()) await decision.click();
    await page.getByRole('button', { name: /تابع في الرحلة|احفظ التكوين وتابع/ }).click();
  }
}

test('operational context participates in recommendation and contradictory evidence stays bounded', () => {
  const operational = assessStartRecommendation({
    currentProblem: 'أريد تحسين الوضع الحالي',
    objective: 'أريد نتيجة أوضح للفريق',
    intendedUsers: 'أشخاص مختلفون',
    domain: 'بوابة تشغيل لفريق يتابع الطلبات والموافقات والحالات',
  });
  expect(operational.resolution).toBe('decisive');
  expect(operational.recommendedId).toBe('portals');

  const contradiction = assessStartRecommendation({
    currentProblem: 'أريد تنظيم الحجز والمواعيد للعملاء',
    objective: 'رحلة حجز أوضح مع تأكيد الموعد',
    intendedUsers: 'العملاء',
    domain: 'بوابة تشغيل لفريق داخلي يتابع الطلبات والموافقات والحالات',
  });
  expect(contradiction.resolution).toBe('insufficient');
  expect(contradiction.candidateIds).toContain('booking');
  expect(contradiction.candidateIds).toContain('portals');
  expect(contradiction.reasons.join(' ')).toContain('السياق التشغيلي');
});

test('Discover transfers focus on entry, guided adoption, question progression, and recommendation', async ({ page }) => {
  await enterDirectQuestions(page);
  await expect(page.locator('[data-testid="discover-focused-subtree"]')).toBeFocused();

  await page.getByLabel('ما الذي تريد تغييره؟').fill('أريد تنظيم الحجز والمواعيد للعملاء');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await expect(page.locator('[data-testid="discover-focused-subtree"]')).toBeFocused();
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('رحلة حجز أوضح');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما السياق التشغيلي الذي يجب أن نعرفه؟').fill('خدمة بمواعيد');
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
  await expect(page.locator('[data-testid="discover-recommendation-state"]')).toBeFocused();

  await openStart(page);
  await page.getByRole('radio', { name: /أعرف تقريبًا نوع الحل/ }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
  await page.locator('.sfp-family-focus-tabs').getByRole('button', { name: /الحجوزات والخدمات/ }).click();
  await page.getByRole('button', { name: /اعتمد الحجوزات والخدمات كنقطة بداية/ }).click();
  await expect(page.locator('[data-testid="direction-entry-confirmation"]')).toBeFocused();
});

test('Payment exposes the external provider consequence without changing the configured budget band by itself', async ({ page }) => {
  await reachBookingPayment(page);
  const budget = page.locator('[data-testid="project-pulse"]').getByText(/USD/);
  const before = await budget.textContent();

  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  const consequence = page.locator('[data-testid="decision-consequence"]');
  await expect(consequence).toContainText('Payment Provider');
  await expect(consequence).toContainText('وحده لا يغيّر نطاق الميزانية التقريبي الحالي');
  await expect(budget).toHaveText(before ?? '');
});

test('START has no nested main landmark and Review DOM/visual order is Summary then Blueprint', async ({ page }) => {
  await reachBookingPayment(page);
  await expect(page.locator('.start-discovery main')).toHaveCount(0);
  await finishBookingBuild(page);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
  await page.setViewportSize({ width: 390, height: 844 });

  const ordering = await page.evaluate(() => {
    const summary = document.querySelector('[data-testid="project-summary"]');
    const blueprint = document.querySelector('[data-testid="project-blueprint"]');
    if (!(summary instanceof HTMLElement) || !(blueprint instanceof HTMLElement)) throw new Error('Missing review nodes');
    return {
      domSummaryFirst: Boolean(summary.compareDocumentPosition(blueprint) & Node.DOCUMENT_POSITION_FOLLOWING),
      summaryTop: summary.getBoundingClientRect().top,
      blueprintTop: blueprint.getBoundingClientRect().top,
    };
  });

  expect(ordering.domSummaryFirst).toBe(true);
  expect(ordering.summaryTop).toBeLessThanOrEqual(ordering.blueprintTop);
});

test('Payment remains explicit in Review as an external service while review stays bounded', async ({ page }) => {
  await reachBookingPayment(page);
  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  await finishBookingBuild(page);
  const summary = page.locator('[data-testid="project-summary"]');
  await expect(summary).toContainText('خدمات خارجية');
  await expect(summary).toContainText('Payment Provider');
  await expect(summary.locator('.sfp-review-needs li')).toHaveCount(3);
});
