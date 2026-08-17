import { expect, test, type Page } from '@playwright/test';

const SOLUTIONS = '#solutions-exploration';
const SOLUTIONS_ROUTE_FOCUS = '.integrated-public-page--solutions';

const publicRoutes = [
  { path: '/', focus: '#main-content' },
  { path: '/solutions', focus: SOLUTIONS_ROUTE_FOCUS },
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
  await openRoute(page, '/solutions', SOLUTIONS_ROUTE_FOCUS);
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('data-mode', 'explore');
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
    return { focused: document.activeElement === element, bottom: bounds.bottom };
  });
  expect(state.focused).toBe(false);
  expect(state.bottom).toBeLessThanOrEqual(0);
}

test('supports direct production entry to every public destination', async ({ page }) => {
  for (const route of publicRoutes) await openRoute(page, route.path, route.focus);
});

test('header navigation reaches every accepted production route', async ({ page }) => {
  await openRoute(page, '/', '#main-content');
  for (const [label, path, focus] of [
    ['الحلول', '/solutions', SOLUTIONS_ROUTE_FOCUS],
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
  await openRoute(page, '/solutions', SOLUTIONS_ROUTE_FOCUS);
  const openButton = page.getByRole('button', { name: 'فتح قائمة التنقل' });
  await openButton.focus();
  await page.keyboard.press('Enter');
  const closeButton = page.getByRole('button', { name: 'إغلاق قائمة التنقل' });
  await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.hero-nav__mobile-panel').getByRole('link', { name: 'الحلول', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(openButton).toBeFocused();
  await page.keyboard.press('Space');
  const methodLink = page.locator('.hero-nav__mobile-panel').getByRole('link', { name: 'كيف نعمل', exact: true });
  await methodLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/how-we-work$/);
  await expect(page.locator('#how-we-work-title')).toBeFocused();
});

test('browser Back and Forward restore routes, focus, and saved scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await openRoute(page, '/solutions', SOLUTIONS_ROUTE_FOCUS);
  await page.evaluate(() => window.scrollTo(0, 360));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
  await page.evaluate(() => document.querySelector<HTMLAnchorElement>('.hero-nav__links a[href="/how-we-work"]')?.click());
  await expect(page.locator('#how-we-work-title')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(page.locator(SOLUTIONS_ROUTE_FOCUS)).toBeFocused();
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
  for (const selector of ['#hero', '#solutions-universe', '#reference-proof', '#system-anatomy', '#project-gateway']) {
    await expect(page.locator(selector)).toBeVisible();
  }
  await page.locator('#solutions-universe').locator('.s02-station-5').click();
  await expect(page.locator('#solutions-universe')).toHaveAttribute('data-active', 'portals');
  await page.locator('#reference-proof').locator('[data-project-selector="rp04"]').click();
  await expect(page.locator('#reference-proof')).toHaveAttribute('data-project', 'rp04');
});

test('Solutions exposes all six accepted families inside one exploration route', async ({ page }) => {
  await openSolutions(page);
  const titles = [
    'مواقع الأعمال والخدمات',
    'التجارة الرقمية وتجارب العلامات',
    'الحجوزات والخدمات',
    'العقارات والأصول',
    'الأنظمة التشغيلية والبوابات',
    'التعليم والمعرفة والمحتوى',
  ];
  await expect(page.getByRole('tab')).toHaveCount(6);
  for (const title of titles) {
    const family = page.getByRole('tab', { name: new RegExp(title) });
    await family.click();
    await expect(family).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel').getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/solutions$/);
  }
});

test('Solutions selected family stays product-led and bounded', async ({ page }) => {
  await openSolutions(page);
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { name: 'الحجوزات والخدمات', exact: true })).toBeVisible();
  await expect(panel.locator('[data-asset-id="FAM-03-MSC-01"]')).toBeVisible();
  await expect(panel.locator('[data-asset-id^="FAM-03-DIR-"]')).toHaveCount(3);
  await expect(panel.getByText(/ليست قوالب أو باقات أو منتجات جاهزة للبيع/)).toBeVisible();
  await expect(panel.getByText(/ليس عرض سعر/)).toBeVisible();
  await expect(panel.getByText('RP-03 — Booking & Service Operations')).toBeVisible();
  await expect(page.getByText(/Capability Builder|Project Pulse|تكوين الاتجاه/)).toHaveCount(0);
});

test('Solutions family navigation keeps keyboard focus and explicit selected state', async ({ page }) => {
  await openSolutions(page);
  const booking = page.getByRole('tab', { name: /الحجوزات والخدمات/ });
  await booking.focus();
  await page.keyboard.press('ArrowDown');
  const assets = page.getByRole('tab', { name: /العقارات والأصول/ });
  await expect(assets).toBeFocused();
  await expect(assets).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('data-family', 'assets');
});

test('Solutions compare is an in-route bounded state with the central distinction intact', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: 'قارن الحجوزات بالتشغيل' }).click();
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('data-mode', 'compare');
  await expect(page.locator('.solutions-compare-row')).toHaveCount(5);
  await expect(page.getByText('رحلة العميل إلى الخدمة والموعد')).toBeVisible();
  await expect(page.getByText('عمل الفريق والطلبات والسجلات')).toBeVisible();
  await expect(page).toHaveURL(/\/solutions$/);
});

test('Solutions selected-family CTA enters frozen START with only selected-family provenance', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: 'ابدأ من هذا الاتجاه' }).first().click();
  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-major-stage-count', '3');
  await expectSkipLinkParked(page);
  const carried = await page.evaluate(() => {
    const state = window.history.state as { usr?: { discoveryPrefill?: Record<string, unknown> } } | null;
    return state?.usr?.discoveryPrefill;
  });
  expect(carried).toEqual({
    version: 1,
    source: { adapter: 'solutions-exploration', label: 'استكشاف الحلول', referenceId: 'booking' },
    solutionFamilyId: 'booking',
    decisionOrigin: 'USER_DIRECT',
  });
});

test('Solutions compare action carries USER_COMPARE without capability or fact fabrication', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: 'قارن الحجوزات بالتشغيل' }).click();
  await page.getByRole('button', { name: 'ابدأ من الأنظمة التشغيلية والبوابات' }).click();
  await expect(page).toHaveURL(/\/start$/);
  const carried = await page.evaluate(() => {
    const state = window.history.state as { usr?: { discoveryPrefill?: Record<string, unknown> } } | null;
    return state?.usr?.discoveryPrefill;
  });
  expect(carried).toEqual({
    version: 1,
    source: { adapter: 'solutions-exploration', label: 'استكشاف الحلول', referenceId: 'portals' },
    solutionFamilyId: 'portals',
    decisionOrigin: 'USER_COMPARE',
  });
});

test('Solutions escape hatch enters START Discover without fabricated family selection', async ({ page }) => {
  await openSolutions(page);
  await page.getByRole('button', { name: 'لست متأكدًا من الاتجاه؟ ساعدني على الاختيار' }).click();
  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'false');
  const carried = await page.evaluate(() => {
    const state = window.history.state as { usr?: { discoveryPrefill?: unknown } } | null;
    return state?.usr?.discoveryPrefill;
  });
  expect(carried).toBeUndefined();
});

test('Start direct entry needs no prefill and remains progressively functional', async ({ page }) => {
  await openRoute(page, '/start', '#start-discovery-title');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'false');
  await expect(page.locator('.sfp-stage-rail li')).toHaveCount(3);
  const entry = page.getByRole('radio', { name: /ساعدني على اكتشاف ما أحتاج/ });
  await entry.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
  await page.getByLabel('ما الذي تريد تغييره؟').fill('أريد تنظيم الحجز والمواعيد للعملاء.');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء وفريق الخدمة');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('حجز أوضح بخطوات أقل');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
});

test('Reference Projects exposes all four focus states and no fabricated route', async ({ page }) => {
  await openRoute(page, '/reference-projects', '#reference-projects-title');
  for (const projectId of ['rp01', 'rp02', 'rp03', 'rp04']) {
    const selector = page.locator(`[data-project-selector="${projectId}"]`);
    await selector.click();
    await expect(page.locator('.reference-projects-body')).toHaveAttribute('data-active-project', projectId);
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
  await expect(page.locator('.how-we-work-body')).toHaveAttribute('data-active-stage', 'transition');
});

test('integrated Arabic and English runs preserve deliberate direction', async ({ page }) => {
  await openRoute(page, '/solutions', SOLUTIONS_ROUTE_FOCUS);
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.solutions-eyebrow').first()).toHaveCSS('direction', 'rtl');
  await expect(page.locator('.solutions-budget strong')).toHaveCSS('direction', 'ltr');
  await openRoute(page, '/reference-projects', '#reference-projects-title');
  await expect(page.locator('.reference-projects-body')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.rp-project-selector__code').first()).toHaveCSS('direction', 'ltr');
  await openRoute(page, '/how-we-work', '#how-we-work-title');
  await expect(page.locator('.how-we-work-body')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.scope-architecture small').first()).toHaveCSS('direction', 'ltr');
  await openRoute(page, '/start', '#start-discovery-title');
  await page.getByRole('radio', { name: /أعرف تقريبًا نوع الحل/ }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
  await page.getByRole('button', { name: /اعتمد مواقع الأعمال والخدمات كنقطة بداية/ }).click();
  const need = page.getByLabel('النتيجة المطلوبة');
  await need.fill('Improve service intake');
  await expect(need).toHaveCSS('direction', 'ltr');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`all public destinations have zero horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 900 });
    for (const route of publicRoutes) {
      await openRoute(page, route.path, route.focus);
      await expectNoHorizontalOverflow(page);
    }
  });
}
