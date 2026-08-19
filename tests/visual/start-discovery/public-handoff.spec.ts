import { expect, test, type Page } from '@playwright/test';

type ExternalUserDecisionOrigin = 'USER_DIRECT' | 'USER_COMPARE';

function externalSelectionPrefill(
  decisionOrigin: ExternalUserDecisionOrigin,
  solutionFamilyId = 'portals',
) {
  return {
    version: 1,
    source: {
      adapter: 'solutions-decision-workspace',
      label: 'ملخص قرار الحلول',
      referenceId: `START-F1-${decisionOrigin}`,
    },
    solutionFamilyId,
    decisionOrigin,
    capabilitySelections: [],
    capturedFacts: {
      outcome: 'جمع الطلبات والحالات في مسار واحد',
      activity: 'عمليات وفرق',
      audience: 'فريق داخلي',
    },
  };
}

function finderPrefill() {
  return {
    version: 1,
    source: {
      adapter: 'solutions-decision-workspace',
      label: 'ملخص قرار الحلول',
      referenceId: 'START-F1-SYSTEM-FINDER',
    },
    recommendedFamily: 'الحجوزات والخدمات',
    solutionFamilyId: 'booking',
    decisionOrigin: 'SYSTEM_FINDER',
    recommendationResolution: 'decisive',
    capabilitySelections: [],
    capturedFacts: {
      outcome: 'جعل الحجز أوضح للعميل والفريق',
      activity: 'خدمة تعتمد على المواعيد',
      audience: 'عملاء وفريق خدمة',
    },
  };
}

async function openStartWithPrefill(page: Page, discoveryPrefill: Record<string, unknown>) {
  await page.goto('/start');
  await page.evaluate((prefill) => {
    window.sessionStorage.removeItem('gs-start-frozen-product-v1');
    const current = window.history.state ?? {};
    window.history.replaceState(
      { ...current, usr: { discoveryPrefill: prefill } },
      '',
      '/start',
    );
  }, discoveryPrefill);
  await page.reload();
  await expect(page.locator('.start-discovery')).toBeVisible();
}

async function readFrozenStartState(page: Page) {
  return page.evaluate(() => JSON.parse(window.sessionStorage.getItem('gs-start-frozen-product-v1') ?? 'null'));
}

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

test('external USER_DIRECT and USER_COMPARE selections stay user-owned and continue without synthetic candidates', async ({ page }) => {
  const pageErrors: Error[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  for (const origin of ['USER_DIRECT', 'USER_COMPARE'] as const) {
    await openStartWithPrefill(page, externalSelectionPrefill(origin));

    const selection = page.locator('[data-testid="user-selection"]');
    await expect(selection).toContainText('الأنظمة التشغيلية والبوابات');
    await expect(selection).toContainText('ليس توصية من النظام');
    await expect(page.locator('[data-testid="system-recommendation"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="bounded-candidate-choice"]')).toHaveCount(0);
    await expect(page.locator('.start-discovery')).toHaveAttribute('data-selected-family', 'portals');
    await expect(page.locator('.start-discovery')).toHaveAttribute('data-recommended-family', '');

    const stored = await readFrozenStartState(page);
    expect(stored.local.selected).toBe('portals');
    expect(stored.local.recommended).toBeUndefined();
    expect(stored.local.candidateIds).toEqual([]);
    expect(stored.draft.solutionFamilyId).toBe('portals');
    expect(stored.draft.recommendedFamily).toBe('');
    expect(stored.draft.decisionOrigin).toBe(origin);

    if (origin === 'USER_DIRECT') {
      for (const width of [1440, 768, 430, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const geometry = await page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
        }));
        expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      }
    }

    const next = page.getByRole('button', { name: /تابع مع اختيارك/ });
    await expect(next).toBeEnabled();
    if (origin === 'USER_DIRECT') {
      await next.focus();
      await next.press('Enter');
      await expect(page.locator('#start-build-title')).toBeFocused();
    } else {
      await next.click();
    }
    await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');

    const continued = await readFrozenStartState(page);
    expect(continued.local.selected).toBe('portals');
    expect(continued.local.recommended).toBeUndefined();
    expect(continued.local.candidateIds).toEqual([]);
    expect(continued.draft.solutionFamilyId).toBe('portals');
    expect(continued.draft.recommendedFamily).toBe('');
    expect(continued.draft.decisionOrigin).toBe(origin);
  }

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('matching stored USER_COMPARE selection restores without recommendation or empty candidate choice', async ({ page }) => {
  await openStartWithPrefill(page, externalSelectionPrefill('USER_COMPARE'));
  const beforeReload = await readFrozenStartState(page);
  expect(beforeReload.local).toMatchObject({ selected: 'portals', candidateIds: [] });
  expect(beforeReload.local.recommended).toBeUndefined();
  expect(beforeReload.draft).toMatchObject({
    solutionFamilyId: 'portals',
    recommendedFamily: '',
    decisionOrigin: 'USER_COMPARE',
  });

  await page.reload();
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('الأنظمة التشغيلية والبوابات');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('ليس توصية من النظام');
  await expect(page.locator('[data-testid="system-recommendation"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="bounded-candidate-choice"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /تابع مع اختيارك/ })).toBeEnabled();

  const restored = await readFrozenStartState(page);
  expect(restored.local).toMatchObject({ selected: 'portals', candidateIds: [] });
  expect(restored.local.recommended).toBeUndefined();
  expect(restored.draft).toMatchObject({
    solutionFamilyId: 'portals',
    recommendedFamily: '',
    decisionOrigin: 'USER_COMPARE',
  });
});

test('SYSTEM_FINDER remains recommendation-only and invalid external family stays safely unselected', async ({ page }) => {
  await openStartWithPrefill(page, finderPrefill());
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
  await expect(page.locator('[data-testid="bounded-candidate-choice"]')).toHaveCount(0);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-selected-family', '');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-recommended-family', 'booking');

  const finderState = await readFrozenStartState(page);
  expect(finderState.local.recommended).toBe('booking');
  expect(finderState.local.selected).toBeUndefined();
  expect(finderState.local.candidateIds).toEqual([]);
  expect(finderState.draft.recommendedFamily).toBe('الحجوزات والخدمات');
  expect(finderState.draft.solutionFamilyId).toBe('');
  expect(finderState.draft.decisionOrigin).toBe('SYSTEM_FINDER');

  await openStartWithPrefill(page, externalSelectionPrefill('USER_DIRECT', 'not-a-family'));
  await expect(page.locator('[data-testid="system-recommendation"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="bounded-candidate-choice"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
  await expect(page.getByRole('button', { name: /اختر هذا الاتجاه/ })).toBeDisabled();
  await expect(page.getByText('قارن أو اختر اتجاهًا آخر')).toBeVisible();

  const invalidState = await readFrozenStartState(page);
  expect(invalidState.local.selected).toBeUndefined();
  expect(invalidState.local.recommended).toBeUndefined();
  expect(invalidState.local.candidateIds).toEqual([]);
  expect(invalidState.draft.solutionFamilyId).toBe('not-a-family');
  expect(invalidState.draft.decisionOrigin).toBe('USER_DIRECT');
});

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
