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

async function returnFromBuildToReview(page: Page) {
  while ((await page.locator('.start-discovery').getAttribute('data-stage')) === 'build') {
    const next = page.getByRole('button', { name: /تابع في الرحلة|احفظ التكوين وتابع/ });
    if (await next.isDisabled()) {
      const decision = page.locator('.sfp-decision [role="radio"]').first();
      if (await decision.count()) await decision.click();
    }
    await next.click();
  }
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
}

test('public START saves a truthful local Project Brief without submission or false project creation', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  await reachReview(page);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('.start-discovery main')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /ابدأ المشروع|أرسل|شراء|دفع/ })).toHaveCount(0);

  const postCompletionRequests: string[] = [];
  const captureRequest = (request: { url(): string }) => postCompletionRequests.push(request.url());
  page.on('request', captureRequest);
  await page.getByRole('button', { name: 'احفظ موجز المشروع محليًا' }).click();
  const handoff = page.locator('[data-testid="project-brief-handoff"]');
  await expect(handoff).toBeVisible();
  await expect(handoff).toHaveAttribute('data-handoff-state', 'current');
  await expect(handoff).toContainText('حُفظ هذا الموجز داخل جلسة المتصفح فقط');
  await expect(handoff).toContainText('لم يُنشأ مشروع أو طلب أو عملية شراء');
  await expect(handoff).toContainText('الحجوزات والخدمات');
  await expect(page.getByRole('button', { name: 'تم حفظ الموجز محليًا' })).toBeDisabled();
  page.off('request', captureRequest);
  expect(postCompletionRequests).toEqual([]);
  expect(pageErrors).toEqual([]);

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
  expect(payload.explicitChannels.optionalCapabilities).toEqual([]);
  expect(payload.explicitChannels).toHaveProperty('uncertainCapabilities');
  expect(payload.explicitChannels.dependencies).toContain('مزود دفع خارجي (Payment Provider)');
  expect(payload.explicitChannels.unknowns).toEqual([]);
  expect(payload.explicitChannels.existingSystems).toBe('');
  expect(payload.explicitChannels.integrations).toBe('');

  await page.reload();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toBeVisible();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toHaveAttribute('data-handoff-state', 'current');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
});

test('editing after Handoff marks the saved Project Brief stale until it is re-reviewed and saved again', async ({ page }) => {
  await reachReview(page);
  await page.getByRole('button', { name: 'احفظ موجز المشروع محليًا' }).click();
  const handoff = page.locator('[data-testid="project-brief-handoff"]');
  await expect(handoff).toHaveAttribute('data-handoff-state', 'current');

  await page.getByRole('button', { name: 'عدّل قرارات الحل' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await expect(handoff).toHaveAttribute('data-handoff-state', 'stale');
  await expect(handoff).toContainText('لم نعد نعرض الموجز القديم على أنه الحالة الحالية');

  await page.reload();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toHaveAttribute('data-handoff-state', 'stale');
  await returnFromBuildToReview(page);
  await page.getByRole('button', { name: 'احفظ موجز المشروع محليًا' }).click();
  await expect(page.locator('[data-testid="project-brief-handoff"]')).toHaveAttribute('data-handoff-state', 'current');
});

test('Project Brief storage failure is recoverable and never exposes false success', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (key === 'gs-start-project-brief-v1') {
        throw new DOMException('Simulated session storage failure', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    };
  });

  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  await reachReview(page);
  await page.getByRole('button', { name: 'احفظ موجز المشروع محليًا' }).click();

  await expect(page.locator('[data-testid="project-brief-handoff"]')).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('تعذر حفظ موجز المشروع داخل جلسة المتصفح');
  await expect(page.getByRole('alert')).toContainText('لم نسجل نجاحًا');
  await expect(page.getByRole('button', { name: 'أعد محاولة حفظ الموجز محليًا' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'تم حفظ الموجز محليًا' })).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('the shared START header renders the current-route action as orientation, not a self-link', async ({ page }) => {
  await page.goto('/start');
  await expect(page.locator('.start-discovery')).toBeVisible();
  const contact = page.locator('.hero-nav__contact');
  await expect(contact).toHaveAttribute('aria-current', 'page');
  expect(await contact.evaluate((node) => node.tagName)).toBe('SPAN');
  await expect(page.getByRole('link', { name: 'ابدأ اختيارك' })).toHaveCount(0);
});
