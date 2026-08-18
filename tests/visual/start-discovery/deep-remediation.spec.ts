import { expect, test, type Page } from '@playwright/test';

const previewPath = './';

async function openStart(page: Page, query = '') {
  await page.goto(previewPath);
  await page.evaluate(() => window.sessionStorage.removeItem('gs-start-frozen-product-v1'));
  await page.goto(`${previewPath}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.start-discovery')).toBeVisible();
}

async function openBookingBuild(page: Page) {
  await openStart(page, '?prefill=booking');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
}

async function reachBookingDecision(page: Page) {
  await openBookingBuild(page);
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

test('first-time Discover explains its concrete local output and required-versus-optional inputs', async ({ page }) => {
  await openStart(page);
  await expect(page.locator('.sfp-stage-heading')).toContainText('مخطط وموجز مشروع يمكنك حفظهما داخل جلسة المتصفح');
  await expect(page.locator('.sfp-stage-heading')).toContainText('ليست إنشاء مشروع أو إرسال طلب');

  await page.getByRole('radio', { name: /ساعدني على اكتشاف ما أحتاج/ }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
  await expect(page.locator('.sfp-field-guidance')).toContainText('التغيير والمستخدمون والنتيجة مطلوبة');
  await expect(page.locator('.sfp-field-guidance')).toContainText('السياق التشغيلي اختياري');
});

test('keyboard entry selection and BUILD progression preserve deliberate focus orientation', async ({ page }) => {
  await openStart(page);
  const firstEntry = page.getByRole('radio', { name: /ساعدني على اكتشاف ما أحتاج/ });
  await firstEntry.focus();
  await firstEntry.press('ArrowDown');
  const secondEntry = page.getByRole('radio', { name: /أعرف تقريبًا نوع الحل/ });
  await expect(secondEntry).toBeFocused();
  await expect(secondEntry).toHaveAttribute('aria-checked', 'true');

  await openBookingBuild(page);
  const currentMoment = page.locator('.sfp-current-moment');
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await expect(currentMoment).toBeFocused();
  await expect(currentMoment).toContainText('الحجز');
});

test('a BUILD decision explains its blocked continuation and accepts explicit undecided as a valid answer', async ({ page }) => {
  await reachBookingDecision(page);
  const actions = page.locator('.sfp-build-actions');
  const next = actions.getByRole('button', { name: /تابع في الرحلة/ });
  await expect(next).toBeDisabled();
  await expect(actions).toContainText('اختر إجابة واحدة للمتابعة');
  await expect(actions).toContainText('لم أحدد بعد');

  await page.getByRole('radio', { name: /لم أحدد بعد/ }).click();
  await expect(next).toBeEnabled();
});

test('primary continuation stays before optional BUILD support and page does not overflow at required widths', async ({ page }) => {
  await reachBookingDecision(page);
  await page.getByRole('radio', { name: /لم أحدد بعد/ }).click();

  for (const width of [1440, 768, 430, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.evaluate(() => {
      const actions = document.querySelector('.sfp-build-actions');
      const support = document.querySelector('.sfp-build-support');
      if (!(actions instanceof HTMLElement) || !(support instanceof HTMLElement)) throw new Error('Missing BUILD hierarchy nodes');
      return {
        actionsTop: actions.getBoundingClientRect().top,
        supportTop: support.getBoundingClientRect().top,
        viewportWidth: window.innerWidth,
        pageWidth: document.documentElement.scrollWidth,
      };
    });
    expect(geometry.actionsTop).toBeLessThan(geometry.supportTop);
    expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  }
});

test('Review edit routes back to Discover when the unresolved issue originated in carried discovery context', async ({ page }) => {
  await openBookingBuild(page);
  await finishBookingBuild(page);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
  await expect(page.getByRole('button', { name: 'عدّل معلومات الاكتشاف' })).toBeVisible();
  await page.getByRole('button', { name: 'عدّل معلومات الاكتشاف' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'discover');
});

test('session-state persistence survives reload without console or page errors', async ({ page }) => {
  const pageErrors: Error[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await reachBookingDecision(page);
  await page.getByRole('radio', { name: /لم أحدد بعد/ }).click();
  await page.reload();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await expect(page.getByRole('radio', { name: /لم أحدد بعد/ })).toHaveAttribute('aria-checked', 'true');
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
