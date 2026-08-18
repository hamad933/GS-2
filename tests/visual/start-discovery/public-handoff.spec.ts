import { expect, test, type Page } from '@playwright/test';

async function reachReview(page: Page) {
  await page.goto('/start');
  await expect(page.locator('.start-discovery')).toBeVisible();
  await page.getByRole('radio', { name: /ساعدني على اكتشاف ما أحتاج/ }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
  await page.getByLabel('ما الذي تريد تغييره؟').fill('أريد تنظيم الحجز والمواعيد للعملاء');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء وفريق الخدمة');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('رحلة حجز أوضح بخطوات أقل');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما السياق التشغيلي الذي يجب أن نعرفه؟').fill('خدمة بمواعيد يديرها فريق خدمة');
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();

  while ((await page.locator('.start-discovery').getAttribute('data-stage')) === 'build') {
    const decision = page.locator('.sfp-decision [role="radio"]').first();
    if (await decision.count()) await decision.click();
    await page.getByRole('button', { name: /تابع في الرحلة|احفظ التكوين وتابع/ }).click();
  }

  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
}

test('public START completes into a truthful local Project Brief without a second main or network submission', async ({ page }) => {
  await reachReview(page);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('.start-discovery main')).toHaveCount(0);

  const postCompletionRequests: string[] = [];
  const captureRequest = (request: { url(): string }) => postCompletionRequests.push(request.url());
  page.on('request', captureRequest);
  await page.getByRole('button', { name: 'ابدأ المشروع بهذا المخطط' }).click();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toBeVisible();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toContainText('حُفظ هذا الموجز داخل جلسة المتصفح فقط');
  page.off('request', captureRequest);
  expect(postCompletionRequests).toEqual([]);

  const payload = await page.evaluate(() => JSON.parse(window.sessionStorage.getItem('gs-start-project-brief-v1') ?? 'null'));
  expect(payload).toMatchObject({
    version: 1,
    mode: 'LOCAL_PUBLIC_HANDOFF',
    directionTruth: {
      recommendedFamily: 'الحجوزات والخدمات',
      adoptedFamilyId: 'booking',
    },
  });
  expect(payload.summary).toBeTruthy();
  expect(payload.draft).toBeTruthy();
  expect(payload.provenance).toHaveProperty('capabilitySelections');
  expect(payload.explicitChannels).toHaveProperty('selectedCapabilities');
  expect(payload.explicitChannels).toHaveProperty('optionalCapabilities');
  expect(payload.explicitChannels).toHaveProperty('uncertainCapabilities');
  expect(payload.explicitChannels).toHaveProperty('dependencies');
  expect(payload.explicitChannels).toHaveProperty('unknowns');
  expect(payload.explicitChannels).toHaveProperty('existingSystems');
  expect(payload.explicitChannels).toHaveProperty('integrations');

  await page.reload();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toBeVisible();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
});
