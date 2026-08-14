import { expect, test, type Page } from '@playwright/test';

const lazyRouteChunks = [
  'SolutionsRoute-',
  'ReferenceProjectsRoute-',
  'HowWeWorkRoute-',
  'StartDiscoveryRoute-',
] as const;

const publicRoutes = [
  { path: '/', focus: '#main-content', active: '.hero-nav__links a[href="/"]' },
  { path: '/solutions', focus: '#gsdw-entry-title', active: '.hero-nav__links a[href="/solutions"]' },
  {
    path: '/reference-projects',
    focus: '#reference-projects-title',
    active: '.hero-nav__links a[href="/reference-projects"]',
  },
  { path: '/how-we-work', focus: '#how-we-work-title', active: '.hero-nav__links a[href="/how-we-work"]' },
  { path: '/start', focus: '#start-discovery-title', active: '.hero-nav__contact' },
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

async function expectRouteReady(page: Page, path: string, focusSelector: string) {
  await expect(page).toHaveURL(new RegExp(path === '/' ? '/$' : `${path}$`));
  await expect(page.locator(focusSelector).first()).toBeVisible();
  await expect(page.locator(focusSelector).first()).toBeFocused();
  await expect(page.locator('[data-route-loading]')).toHaveCount(0);
}

async function openRoute(page: Page, path: string, focusSelector: string) {
  await page.goto(path);
  await expectRouteReady(page, path, focusSelector);
}

async function navigateWithRouteState(page: Page, state: unknown, key: string) {
  await page.goto('/');
  await expect(page.locator('#hero')).toBeVisible();
  await page.evaluate(({ nextState, nextKey }) => {
    const currentIndex = typeof window.history.state?.idx === 'number'
      ? window.history.state.idx
      : 0;
    const historyState = {
      usr: nextState,
      key: nextKey,
      idx: currentIndex + 1,
    };
    window.history.pushState(historyState, '', '/start');
    window.dispatchEvent(new PopStateEvent('popstate', { state: historyState }));
  }, { nextState: state, nextKey: key });
  await expectRouteReady(page, '/start', '#start-discovery-title');
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test('Home loads without requesting any non-Home route implementation chunk', async ({ page }) => {
  const scriptRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scriptRequests.push(request.url());
  });

  await openRoute(page, '/', '#main-content');
  for (const chunkName of lazyRouteChunks) {
    expect(scriptRequests.some((url) => url.includes(chunkName))).toBe(false);
  }

  await page.locator('.hero-nav__links a[href="/solutions"]').click();
  await expectRouteReady(page, '/solutions', '#gsdw-entry-title');
  expect(scriptRequests.some((url) => url.includes('SolutionsRoute-'))).toBe(true);
  for (const chunkName of lazyRouteChunks.slice(1)) {
    expect(scriptRequests.some((url) => url.includes(chunkName))).toBe(false);
  }
});

test('a real delayed route chunk exposes loading state then focuses final content', async ({ page }) => {
  await openRoute(page, '/', '#main-content');

  let releaseChunk = () => undefined;
  let chunkIntercepted = false;
  const chunkGate = new Promise<void>((resolve) => {
    releaseChunk = resolve;
  });
  await page.route(/\/assets\/SolutionsRoute-[^/?]+\.js(?:\?.*)?$/, async (route) => {
    chunkIntercepted = true;
    await chunkGate;
    await route.continue();
  });

  try {
    await page.locator('.hero-nav__links a[href="/solutions"]').click();
    await expect.poll(() => chunkIntercepted).toBe(true);
    const loadingState = page.locator('[data-route-loading]');
    await expect(loadingState).toBeVisible();
    await expect(loadingState).toHaveAttribute('role', 'status');
    await expect(loadingState).toHaveAttribute('aria-busy', 'true');
    await expect(loadingState).not.toBeFocused();
    await expect(page.locator('.hero-nav__links a[href="/solutions"]')).toHaveAttribute(
      'aria-current',
      'page',
    );
  } finally {
    releaseChunk();
  }

  await expectRouteReady(page, '/solutions', '#gsdw-entry-title');
});

test('does not steal focus if a keyboard user moves it while a route is loading', async ({ page }) => {
  await openRoute(page, '/', '#main-content');

  let releaseChunk = () => undefined;
  const chunkGate = new Promise<void>((resolve) => {
    releaseChunk = resolve;
  });
  await page.route(/\/assets\/ReferenceProjectsRoute-[^/?]+\.js(?:\?.*)?$/, async (route) => {
    await chunkGate;
    await route.continue();
  });

  await page.locator('.hero-nav__links a[href="/reference-projects"]').click();
  await expect(page.locator('[data-route-loading]')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  const previousNavLink = page.locator('.hero-nav__links a[href="/solutions"]');
  await expect(previousNavLink).toBeFocused();
  releaseChunk();

  await expect(page.locator('#reference-projects-title')).toBeVisible();
  await expect(page.locator('[data-route-loading]')).toHaveCount(0);
  await expect(previousNavLink).toBeFocused();
});

test('supports direct production entry, final focus, active navigation, and 404', async ({ page }) => {
  for (const route of publicRoutes) {
    await openRoute(page, route.path, route.focus);
    if ('active' in route) {
      await expect(page.locator(route.active)).toHaveAttribute('aria-current', 'page');
    } else {
      await expect(page.locator('[aria-current="page"]')).toHaveCount(0);
    }
  }
});

test('mobile navigation activates a lazy route and lands focus after the panel closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openRoute(page, '/solutions', '#gsdw-entry-title');

  const menuButton = page.getByRole('button', { name: 'فتح قائمة التنقل' });
  await menuButton.focus();
  await page.keyboard.press('Enter');
  const projectsLink = page
    .locator('.hero-nav__mobile-panel')
    .getByRole('link', { name: 'المشاريع المرجعية', exact: true });
  await projectsLink.focus();
  await page.keyboard.press('Enter');

  await expectRouteReady(page, '/reference-projects', '#reference-projects-title');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
});

test('Back and Forward restore focus and saved scroll after lazy routes settle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await openRoute(page, '/solutions', '#gsdw-entry-title');
  await page.evaluate(() => window.scrollTo(0, 360));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);

  await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>(
      '.hero-nav__links a[href="/how-we-work"]',
    )?.click();
  });
  await expectRouteReady(page, '/how-we-work', '#how-we-work-title');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.goBack();
  await expectRouteReady(page, '/solutions', '#gsdw-entry-title');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);

  await page.goForward();
  await expectRouteReady(page, '/how-we-work', '#how-we-work-title');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('a direct hash waits for lazy content, scrolls to its target, and keeps route focus', async ({ page }) => {
  await page.goto('/how-we-work#quality-evidence-title');
  await expect(page.locator('#how-we-work-title')).toBeFocused();
  await expect(page.locator('#quality-evidence-title')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect.poll(() => page.locator('#quality-evidence-title').evaluate(
    (element) => Math.abs(element.getBoundingClientRect().top),
  )).toBeLessThan(2);
});

test('Start accepts valid W02 prefill state and ignores malformed optional fields safely', async ({ page }) => {
  await navigateWithRouteState(page, {
    discoveryPrefill: {
      version: 1,
      source: {
        adapter: 'solutions-decision-workspace',
        label: 'ملخص قرار الحلول',
      },
      selectedOutcome: 'تنظيم عمل وطلبات داخلية',
      recommendedFamily: 'الأنظمة التشغيلية والبوابات',
      selectedCapabilities: ['نمذجة الطلب والحالة'],
      optionalCapabilities: ['تكاملات وهوية وصلاحيات متقدمة'],
      knownDependencies: ['عملية تشغيل قابلة للوصف'],
      unknowns: ['اعتماد غير محسوم'],
    },
  }, 'valid-w02-prefill');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-certainty', 'configured');
  await expect(page.locator('#sd-objective')).toHaveValue('تنظيم عمل وطلبات داخلية');

  await navigateWithRouteState(page, {
    discoveryPrefill: {
      version: 1,
      source: { adapter: 42, label: ['unsafe'] },
      selectedOutcome: 'سياق صالح وحيد',
      selectedCapabilities: ['قدرة سليمة', 42],
      optionalCapabilities: { unsafe: true },
      knownDependencies: 'not-an-array',
      budgetPreference: { unsafe: true },
    },
  }, 'partially-malformed-prefill');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('#sd-objective')).toHaveValue('سياق صالح وحيد');
  await expect(page.getByText('قدرة سليمة', { exact: true })).toHaveCount(0);
});

test('Start stays fully direct-entry functional when route state is absent or unusable', async ({ page }) => {
  await openRoute(page, '/start', '#start-discovery-title');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'false');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-certainty', 'unselected');

  await navigateWithRouteState(page, {
    discoveryPrefill: {
      version: 1,
      source: { adapter: 42 },
      selectedOutcome: { unsafe: true },
      selectedCapabilities: [42],
      unknowns: 'not-an-array',
    },
  }, 'unusable-prefill');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'false');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-certainty', 'unselected');

  const certainty = page.getByRole('radio', { name: /لا أعرف ماذا أحتاج/ });
  await certainty.focus();
  await page.keyboard.press('Space');
  await expect(certainty).toHaveAttribute('aria-checked', 'true');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`all production routes have no horizontal overflow at ${width}px`, async ({ page }) => {
    test.slow();
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
