import { expect, test, type Page } from '@playwright/test';

const WORKSPACE = '#solutions-decision-workspace';

const publicRoutes = [
  { path: '/', focus: '#main-content' },
  { path: '/solutions', focus: '#gsdw-entry-title' },
  { path: '/reference-projects', focus: '#reference-projects-title' },
  { path: '/how-we-work', focus: '#how-we-work-title' },
  { path: '/start', focus: '#start-discovery-title' },
  { path: '/nonexistent-route', focus: '[data-route-focus]' },
] as const;

const runtimeErrors = new WeakMap<Page, { console: string[]; page: string[] }>();

test.beforeEach(async ({ page }) => {
  const errors = { console: [] as string[], page: [] as string[] };
  runtimeErrors.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
});

test.afterEach(async ({ page }) => {
  const errors = runtimeErrors.get(page) ?? { console: [], page: [] };
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});

async function openRoute(page: Page, path: string, focus: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(focus).first()).toBeVisible();
  await expect(page.locator(focus).first()).toBeFocused();
}

async function openSolutions(page: Page) {
  await openRoute(page, '/solutions', '#gsdw-entry-title');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'entry');
}

async function chooseFinderOption(page: Page, name: string, last = false) {
  await page.getByRole('radio', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: last ? /بناء الاتجاه/ : /السؤال التالي/ }).click();
}

async function reachPortalRecommendation(page: Page) {
  await openSolutions(page);
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  await chooseFinderOption(page, 'تنظيم عمل وطلبات داخلية');
  await chooseFinderOption(page, 'عمليات وفرق');
  await chooseFinderOption(page, 'فريق داخلي');
  await page.getByRole('radio', { name: /أنظمة أو تكاملات مهمة/ }).click();
  await page.getByPlaceholder(/نظام قائم/).fill('نظام داخلي قائم يحتاج تحققًا تقنيًا');
  await page.getByRole('button', { name: /بناء الاتجاه/ }).click();
  await expect(page.locator(WORKSPACE)).toHaveAttribute('data-family', 'portals');
}

async function reachDecisionSummary(page: Page) {
  await reachPortalRecommendation(page);
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

async function expectSkipLinkParked(page: Page) {
  const state = await page.locator('.skip-link').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      focused: document.activeElement === element,
      bottom: bounds.bottom,
    };
  });
  expect(state.focused).toBe(false);
  expect(state.bottom).toBeLessThanOrEqual(0);
}

test('supports direct production entry to every public destination', async ({ page }) => {
  for (const route of publicRoutes) {
    await openRoute(page, route.path, route.focus);
  }
});

test('header navigation reaches every accepted production route', async ({ page }) => {
  await openRoute(page, '/', '#main-content');

  for (const [label, path, focus] of [
    ['الحلول', '/solutions', '#gsdw-entry-title'],
    ['المشاريع المرجعية', '/reference-projects', '#reference-projects-title'],
    ['كيف نعمل', '/how-we-work', '#how-we-work-title'],
    ['الرئيسية', '/', '#main-content'],
  ] as const) {
    await page.locator('.hero-nav__links').getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path === '/' ? '/$' : `${path}$`));
    await expect(page.locator(focus)).toBeFocused();
  }

  await page.locator('.hero-nav__contact').click();
  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('#start-discovery-title')).toBeFocused();
  await expect(page.locator('.hero-nav__contact')).toHaveAttribute('aria-current', 'page');
});

test('mobile navigation supports Escape, active state, and route activation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRoute(page, '/solutions', '#gsdw-entry-title');

  const openButton = page.getByRole('button', { name: 'فتح قائمة التنقل' });
  await openButton.focus();
  await page.keyboard.press('Enter');
  const closeButton = page.getByRole('button', { name: 'إغلاق قائمة التنقل' });
  await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.locator('.hero-nav__mobile-panel').getByRole('link', { name: 'الحلول', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  await page.keyboard.press('Escape');
  await expect(openButton).toBeFocused();
  await page.keyboard.press('Space');
  const methodLink = page
    .locator('.hero-nav__mobile-panel')
    .getByRole('link', { name: 'كيف نعمل', exact: true });
  await methodLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/how-we-work$/);
  await expect(page.locator('#how-we-work-title')).toBeFocused();
});

test('browser Back and Forward restore routes, focus, and saved scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await openRoute(page, '/solutions', '#gsdw-entry-title');
  await page.evaluate(() => window.scrollTo(0, 360));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);

  await page.evaluate(() => {
    const link = document.querySelector<HTMLAnchorElement>(
      '.hero-nav__links a[href="/how-we-work"]',
    );
    link?.click();
  });
  await expect(page.locator('#how-we-work-title')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(page.locator('#gsdw-entry-title')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);

  await page.goForward();
  await expect(page).toHaveURL(/\/how-we-work$/);
  await expect(page.locator('#how-we-work-title')).toBeFocused();
});

test('404 is branded, recoverable, and keeps navigation live', async ({ page }) => {
  await openRoute(page, '/nonexistent-route', '[data-route-focus]');
  await expect(page).toHaveTitle('الصفحة غير موجودة | General Solutions');
  await page.getByRole('link', { name: 'العودة إلى الرئيسية' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#hero')).toBeVisible();
});

test('homepage protected sections remain present and interactive', async ({ page }) => {
  await openRoute(page, '/', '#main-content');
  for (const selector of [
    '#hero',
    '#solutions-universe',
    '#reference-proof',
    '#system-anatomy',
    '#project-gateway',
  ]) {
    await expect(page.locator(selector)).toBeVisible();
  }

  await page.locator('#solutions-universe').locator('.s02-station-5').click();
  await expect(page.locator('#solutions-universe')).toHaveAttribute('data-active', 'portals');
  await page.locator('#reference-proof').locator('[data-project-selector="rp04"]').click();
  await expect(page.locator('#reference-proof')).toHaveAttribute('data-project', 'rp04');
});

test('Solutions keeps all three entry modes in the real route', async ({ page }) => {
  await openSolutions(page);
  for (const [label, mode] of [
    ['ساعدني أكتشف ما أحتاجه', 'discover'],
    ['أعرف تقريبًا ما أحتاجه', 'direction'],
    ['أريد مقارنة الخيارات', 'compare'],
  ] as const) {
    await page.getByRole('button', { name: new RegExp(label) }).click();
    await expect(page.locator(WORKSPACE)).toHaveAttribute('data-mode', mode);
    await page.getByRole('button', { name: 'تغيير نقطة البداية' }).click();
    await expect(page.locator(WORKSPACE)).toHaveAttribute('data-step', 'entry');
  }
});

test('Solutions exposes all six accepted families without leaving the route', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: /أعرف تقريبًا ما أحتاجه/ }).click();
  for (const title of [
    'مواقع الأعمال والخدمات',
    'التجارة الرقمية وتجارب العلامات',
    'الحجوزات والخدمات',
    'العقارات والأصول',
    'الأنظمة التشغيلية والبوابات',
    'التعليم والمعرفة والمحتوى',
  ]) {
    const family = page.getByRole('button', { name: new RegExp(title) });
    await family.click();
    await expect(family).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.gsdw-quick-context')).toBeVisible();
  }
  await expect(page).toHaveURL(/\/solutions$/);
});

test('Solutions Finder produces the deterministic recommendation and alternative', async ({ page }) => {
  await reachPortalRecommendation(page);
  await expectSkipLinkParked(page);
  await expect(page.getByRole('heading', { name: 'الأنظمة التشغيلية والبوابات' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الحجوزات والخدمات' })).toBeVisible();
  await expect(page.getByText('اتجاه بديل يستحق النظر')).toBeVisible();
  await expect(page.getByText('عمق التشغيل: أنظمة أو تكاملات مهمة')).toBeVisible();
});

test('Solutions configuration preserves capabilities, budget, dependencies, and human-readable evidence truth', async ({ page }) => {
  await reachDecisionSummary(page);
  await expect(page.getByText('تكاملات وهوية وصلاحيات متقدمة', { exact: true })).toBeVisible();
  await expect(page.getByText('مرونة حسب القيمة', { exact: true })).toBeVisible();
  await expect(page.getByText('نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات')).toBeVisible();
  const unresolved = page.locator('.gsdw-summary-row[data-kind="unknown"]');
  await expect(unresolved).toHaveCount(1);
  await expect(unresolved).not.toContainText('اعتماد غير محسوم: عملية تشغيل قابلة للوصف');
  await expect(page.getByText('مرجع سياقي فقط', { exact: true })).toBeVisible();
  await expect(page.getByText('REFERENCE_ONLY', { exact: true })).toHaveCount(0);
});

test('Solutions Decision Summary carries fact context and decision metadata to Start without authoring the objective', async ({ page }) => {
  await reachDecisionSummary(page);
  await page.getByRole('button', { name: /تجهيز الانتقال إلى Discovery/ }).click();

  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expectSkipLinkParked(page);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-certainty', 'configured');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-major-stage-count', '3');
  await expect(page.locator('[data-testid="carried-context"]')).toContainText(
    'النتيجة: تنظيم عمل وطلبات داخلية',
  );
  await expect(page.locator('[data-testid="carried-context"]')).toContainText('النشاط: عمليات وفرق');
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText(
    'الأنظمة التشغيلية والبوابات',
  );
  await expect(page.locator('[data-testid="user-selection"]')).toContainText(
    'لم تعتمد اتجاهًا بعد.',
  );
  await expect(page.getByLabel('ما الذي تريد تغييره؟')).toHaveCount(0);

  const carriedContext = await page.evaluate(() => {
    const state = window.history.state as {
      usr?: {
        discoveryPrefill?: {
          solutionFamilyId?: string;
          decisionOrigin?: string;
          recommendationResolution?: string;
          capabilitySelections?: Array<{ name: string; provenance: string }>;
        };
      };
    } | null;
    return state?.usr?.discoveryPrefill;
  });
  expect(carriedContext?.solutionFamilyId).toBe('portals');
  expect(carriedContext?.decisionOrigin).toBe('SYSTEM_FINDER');
  expect(carriedContext?.recommendationResolution).toBe('decisive');
  expect(
    carriedContext?.capabilitySelections?.some(
      (item) => item.name === 'تكاملات وهوية وصلاحيات متقدمة' && item.provenance === 'USER_SELECTED',
    ),
  ).toBe(true);

  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
});

test('Start direct entry needs no prefill and remains progressively functional', async ({ page }) => {
  await openRoute(page, '/start', '#start-discovery-title');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'false');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-major-stage-count', '3');

  const entry = page.getByRole('button', { name: /ساعدني على اكتشاف ما أحتاج/ });
  await entry.focus();
  await page.keyboard.press('Enter');
  await page.getByLabel('ما الذي تريد تغييره؟').fill('أريد تنظيم الحجز والمواعيد للعملاء.');
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء وفريق الخدمة');
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('حجز أوضح بخطوات أقل');
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText(
    'الحجوزات والخدمات',
  );
  await expect(page.locator('[data-testid="user-selection"]')).toContainText(
    'لم تعتمد اتجاهًا بعد.',
  );
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
});

test('Reference Projects exposes all four focus states and no fabricated route', async ({ page }) => {
  await openRoute(page, '/reference-projects', '#reference-projects-title');
  for (const projectId of ['rp01', 'rp02', 'rp03', 'rp04']) {
    const selector = page.locator(`[data-project-selector="${projectId}"]`);
    await selector.click();
    await expect(page.locator('.reference-projects-body')).toHaveAttribute(
      'data-active-project',
      projectId,
    );
  }

  const first = page.locator('[data-project-selector="rp01"]');
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-project-selector="rp02"]')).toBeFocused();
  const ledger = page.getByRole('button', { name: /سجل الحدود والتحقق/ });
  await ledger.click();
  await expect(ledger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('ROUTE_NOT_CONFIGURED').first()).toBeVisible();
  await expect(page.locator('.reference-projects-body a[href]')).toHaveCount(0);
});

test('How We Work exposes all method stages, scope classes, and keyboard behavior', async ({ page }) => {
  await openRoute(page, '/how-we-work', '#how-we-work-title');
  for (const stageId of ['discovery', 'fit', 'scope', 'risk', 'build', 'quality', 'transition']) {
    await page.locator(`[data-method-stage="${stageId}"]`).click();
    await expect(page.locator('.how-we-work-body')).toHaveAttribute('data-active-stage', stageId);
  }
  for (const scope of ['required', 'included', 'optional', 'conditional', 'custom', 'unknown']) {
    await expect(page.locator(`[data-scope-state="${scope}"]`)).toBeVisible();
  }

  const first = page.locator('[data-method-stage="discovery"]');
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-method-stage="fit"]')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('[data-method-stage="transition"]')).toBeFocused();
  await expect(page.locator('.how-we-work-body')).toHaveAttribute(
    'data-active-stage',
    'transition',
  );
});

test('integrated Arabic and English runs preserve deliberate direction', async ({ page }) => {
  await openRoute(page, '/solutions', '#gsdw-entry-title');
  await expect(page.locator(WORKSPACE)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.gsdw-eyebrow').first()).toHaveCSS('direction', 'rtl');
  await expect(page.locator('.gsdw-brand small')).toHaveCSS('direction', 'ltr');

  await openRoute(page, '/reference-projects', '#reference-projects-title');
  await expect(page.locator('.reference-projects-body')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.rp-project-selector__code').first()).toHaveCSS('direction', 'ltr');

  await openRoute(page, '/how-we-work', '#how-we-work-title');
  await expect(page.locator('.how-we-work-body')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.scope-architecture small').first()).toHaveCSS('direction', 'ltr');

  await openRoute(page, '/start', '#start-discovery-title');
  await page.getByRole('button', { name: /أعرف تقريبًا نوع الحل/ }).click();
  const need = page.getByLabel('ما الذي تريد تغييره؟');
  await need.fill('Improve service intake');
  await expect(need).toHaveCSS('direction', 'ltr');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`all public destinations have zero horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({
      width,
      height: width === 768 ? 1024 : width <= 430 ? 844 : 900,
    });
    for (const route of publicRoutes) {
      await openRoute(page, route.path, route.focus);
      await expectNoHorizontalOverflow(page);
    }
  });
}
