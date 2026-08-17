import { expect, test, type Page } from '@playwright/test';

const HOME = '#main-content';

const homepageRoutes = [
  {
    name: 'Hero primary',
    section: '#hero',
    label: 'ابدأ اختيارك',
    path: '/start',
    focus: '#start-discovery-title',
    activeNavigation: '.hero-nav__contact',
  },
  {
    name: 'S02 contextual',
    section: '#solutions-universe',
    label: 'استكشف جميع الحلول',
    path: '/solutions',
    focus: '.integrated-public-page--solutions',
    activeNavigation: '.hero-nav__links a[href="/solutions"]',
  },
  {
    name: 'S03 contextual',
    section: '#reference-proof',
    label: 'شاهد المشاريع المرجعية',
    path: '/reference-projects',
    focus: '#reference-projects-title',
    activeNavigation: '.hero-nav__links a[href="/reference-projects"]',
  },
  {
    name: 'S04 contextual',
    section: '#system-anatomy',
    label: 'استكشف كيف نعمل',
    path: '/how-we-work',
    focus: '#how-we-work-title',
    activeNavigation: '.hero-nav__links a[href="/how-we-work"]',
  },
  {
    name: 'S05 primary',
    section: '#project-gateway',
    label: 'ابدأ اختيارك',
    path: '/start',
    focus: '#start-discovery-title',
    activeNavigation: '.hero-nav__contact',
  },
  {
    name: 'S05 secondary',
    section: '#project-gateway',
    label: 'شاهد المشاريع المرجعية',
    path: '/reference-projects',
    focus: '#reference-projects-title',
    activeNavigation: '.hero-nav__links a[href="/reference-projects"]',
  },
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

async function openHome(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(HOME)).toBeFocused();
  await expect(page.locator('#hero')).toHaveAttribute('data-stage', 'need');
}

async function expectVisibleFocus(page: Page, selector: string, label: string) {
  const link = page.locator(selector).getByRole('link', { name: label, exact: true });
  await expect(link).toHaveCount(1);
  await link.focus();
  await expect(link).toBeFocused();
  const focusAppearance = await link.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      boxShadow: style.boxShadow,
    };
  });
  expect(
    (focusAppearance.outlineStyle !== 'none' && focusAppearance.outlineWidth > 0)
      || focusAppearance.boxShadow !== 'none',
  ).toBe(true);
  return link;
}

for (const route of homepageRoutes) {
  test(`${route.name} routes to ${route.path} without a reload and restores Home on Back`, async ({ page }) => {
    await openHome(page);
    await page.evaluate(() => {
      Reflect.set(window, '__w06RouteSentinel', 'alive');
    });
    const navigationEntriesBefore = await page.evaluate(
      () => window.performance.getEntriesByType('navigation').length,
    );
    const link = await expectVisibleFocus(page, route.section, route.label);
    await link.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${route.path}$`));
    await expect(page.locator(route.focus)).toBeFocused();
    await expect(page.locator(route.activeNavigation)).toHaveAttribute('aria-current', 'page');
    await expect.poll(() => page.evaluate(() => Reflect.get(window, '__w06RouteSentinel'))).toBe('alive');
    await expect.poll(() => page.evaluate(
      () => window.performance.getEntriesByType('navigation').length,
    )).toBe(navigationEntriesBefore);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(HOME)).toBeFocused();
    await expect(page.locator('.hero-nav__links a[href="/"]')).toHaveAttribute('aria-current', 'page');
  });
}

test('Homepage interactions remain functional across Hero, S02, S03, and S04', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const hero = page.locator('#hero');
  await expect(hero.getByRole('link', { name: 'استكشف كيف نعمل', exact: true })).toHaveAttribute('href', '/how-we-work');
  await page.getByRole('button', { name: 'إطلاق خدمة رقمية', exact: true }).click();
  await expect(hero).toHaveAttribute('data-stage', 'direction');
  await expect(hero.getByRole('link', { name: 'استكشف الحلول', exact: true })).toHaveAttribute('href', '/solutions');
  await page.getByRole('button', { name: 'خطوة رئيسية واحدة' }).click();
  await expect(hero).toHaveAttribute('data-stage', 'build');
  await expect(hero.getByRole('link', { name: 'شاهد المشاريع المرجعية', exact: true })).toHaveAttribute('href', '/reference-projects');
  for (const action of ['رتّب الرحلة حول الهدف', 'وحّد التجربة', 'جرّب المسار']) {
    await page.getByRole('button', { name: action, exact: true }).click();
  }
  await page.getByLabel('طلبك المختصر', { exact: true }).fill('طلب توضيحي لمسار البداية');
  await page.getByRole('button', { name: 'إرسال الطلب إلى الملخّص', exact: true }).click();
  await expect(hero).toHaveAttribute('data-stage', 'launch');
  await expect(hero).toContainText('لن يُرسل شيء تلقائيًا');
  await expect(hero).not.toContainText('فتح رسالة المشروع');

  const solutions = page.locator('#solutions-universe');
  await solutions.getByRole('button', { name: 'المجال التالي', exact: true }).click();
  await expect(solutions).toHaveAttribute('data-active', 'commerce');
  const portalStation = solutions.locator('.s02-station-5');
  await portalStation.focus();
  await portalStation.press('Enter');
  await expect(solutions).toHaveAttribute('data-active', 'portals');

  const proof = page.locator('#reference-proof');
  await proof.locator('[data-project-selector="rp04"]').click();
  await expect(proof).toHaveAttribute('data-project', 'rp04');
  const rp02 = proof.locator('[data-project-selector="rp02"]');
  await rp02.focus();
  await rp02.press('Space');
  await expect(proof).toHaveAttribute('data-project', 'rp02');

  const anatomy = page.locator('#system-anatomy');
  await anatomy.getByRole('button', { name: 'التكامل', exact: true }).click();
  await expect(anatomy).toHaveAttribute('data-active', 'integration');
  const launchStage = anatomy.getByRole('button', { name: 'الإطلاق والنمو', exact: true });
  await launchStage.focus();
  await launchStage.press('Space');
  await expect(anatomy).toHaveAttribute('data-active', 'launch');
  await expect(page.locator('#project-gateway a[href^="mailto:"]')).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});

test('Homepage entry metadata and deliberate RTL/LTR direction are preserved', async ({ page, request }) => {
  await openHome(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.gs-home')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#reference-proof')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.reference-proof-v2__project-copy > p:first-child')).toHaveCSS('direction', 'ltr');
  await expect(page.locator('.anatomy-brand')).toHaveCSS('direction', 'ltr');
  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute('content', /ابدأ اختيار المسار الأقرب إلى احتياجك/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#071014');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/gs-favicon.svg');
  const faviconResponse = await request.get('/gs-favicon.svg');
  expect(faviconResponse.ok()).toBe(true);
  const entryResponse = await request.get('/');
  const entryHtml = await entryResponse.text();
  expect(entryHtml).toContain('<title>حلول رقمية تبدأ من احتياجك | General Solutions</title>');
  expect(entryHtml).not.toContain('/vite.svg');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`Homepage route affordances have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({
      width,
      height: width === 768 ? 1024 : width <= 430 ? 844 : 900,
    });
    await openHome(page);
    await page.locator('#solutions-universe .s02-station-5').click();
    await page.locator('#reference-proof [data-project-selector="rp02"]').click();
    await page.locator('#system-anatomy').getByRole('button', { name: 'التكامل', exact: true }).click();
    for (const selector of [
      '#hero .e2-cta-primary',
      '#solutions-universe .s02-actions a[href="/solutions"]',
      '#reference-proof .reference-proof-v2__route',
      '#system-anatomy .anatomy-route-link',
      '#project-gateway .gateway-cta--primary',
      '#project-gateway .gateway-cta--secondary',
    ]) await expect(page.locator(selector)).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}
