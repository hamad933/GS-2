import { expect, test, type Page } from '@playwright/test';
import { createStartDiscoveryDraft } from '../../../src/features/start-discovery/discoveryModel';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';

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

async function chooseSolutionsFinderOption(page: Page, name: string, last = false) {
  await page.getByRole('radio', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: last ? /بناء الاتجاه/ : /السؤال التالي/ }).click();
}

async function reachPortalRecommendation(page: Page) {
  await openRoute(page, '/solutions', '#gsdw-entry-title');
  await page.getByRole('button', { name: /ساعدني أكتشف ما أحتاجه/ }).click();
  await chooseSolutionsFinderOption(page, 'تنظيم عمل وطلبات داخلية');
  await chooseSolutionsFinderOption(page, 'عمليات وفرق');
  await chooseSolutionsFinderOption(page, 'فريق داخلي');
  await page.getByRole('radio', { name: /أنظمة أو تكاملات مهمة/ }).click();
  await page.getByPlaceholder(/نظام قائم/).fill('نظام داخلي قائم يحتاج تحققًا تقنيًا');
  await page.getByRole('button', { name: /بناء الاتجاه/ }).click();
  await expect(page.locator('#solutions-decision-workspace')).toHaveAttribute('data-family', 'portals');
}

async function reachSolutionsSummary(page: Page) {
  await reachPortalRecommendation(page);
  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();
  await page.getByRole('button', { name: /تكاملات وهوية وصلاحيات متقدمة/ }).click();
  await page.getByRole('button', { name: /مقارنة اتجاه التكوين/ }).click();
  await page.getByRole('radio', { name: /ربط عدة مسارات مترابطة/ }).click();
  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  await page.getByRole('radio', { name: /مرونة حسب القيمة/ }).click();
  await page.getByPlaceholder('اكتب النطاق أو القيد بصيغتك').fill('نطاق يحدده صاحب القرار بعد مراجعة الاعتمادات');
  await page.getByText('عملية تشغيل قابلة للوصف', { exact: true }).click();
  await page.getByRole('button', { name: /إنتاج ملخص القرار/ }).click();
  await expect(page.locator('#solutions-decision-workspace')).toHaveAttribute('data-step', 'summary');
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

test('capability prefill normalization deduplicates exact duplicates and omits contradictory same-name truths', () => {
  const duplicateDraft = createStartDiscoveryDraft({
    version: START_DISCOVERY_PREFILL_VERSION,
    capabilitySelections: [
      {
        name: 'قدرة مشتركة',
        classification: 'RECOMMENDED',
        provenance: 'SYSTEM_SEEDED',
      },
      {
        name: '  قدرة مشتركة  ',
        classification: 'RECOMMENDED',
        provenance: 'SYSTEM_SEEDED',
      },
    ],
  });
  expect(duplicateDraft.capabilitySelections).toEqual([
    {
      name: 'قدرة مشتركة',
      classification: 'RECOMMENDED',
      provenance: 'SYSTEM_SEEDED',
    },
  ]);

  const contradictoryDraft = createStartDiscoveryDraft({
    version: START_DISCOVERY_PREFILL_VERSION,
    capabilitySelections: [
      {
        name: 'قدرة متعارضة',
        classification: 'RECOMMENDED',
        provenance: 'SYSTEM_SEEDED',
      },
      {
        name: ' قدرة متعارضة ',
        classification: 'CUSTOM',
        provenance: 'USER_SELECTED',
      },
    ],
  });
  expect(contradictoryDraft.capabilitySelections).toEqual([]);
  expect(contradictoryDraft.selectedCapabilities).toEqual([]);
  expect(contradictoryDraft.optionalCapabilities).toEqual([]);
});

test('Start accepts valid W02/current prefill state and ignores malformed optional fields safely', async ({ page }) => {
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
      capabilitySelections: [
        {
          name: 'نمذجة الطلب والحالة',
          classification: 'CORE',
          provenance: 'SYSTEM_SEEDED',
        },
      ],
      capturedFacts: {
        outcome: 'تنظيم عمل وطلبات داخلية',
        activity: 'عمليات وفرق',
        audience: 'فريق داخلي',
        complexity: 'أنظمة أو تكاملات مهمة',
        constraints: 'قيد محفوظ من المصدر',
      },
      knownDependencies: ['عملية تشغيل قابلة للوصف'],
      unknowns: ['اعتماد غير محسوم'],
    },
  }, 'valid-w02-prefill');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-certainty', 'configured');
  await expect(page.locator('#sd-objective')).toHaveValue('تنظيم عمل وطلبات داخلية');
  await expect(page.locator('[data-carried-facts="true"]')).toContainText('النشاط: عمليات وفرق');

  await navigateWithRouteState(page, {
    discoveryPrefill: {
      version: 1,
      source: { adapter: 42, label: ['unsafe'] },
      selectedOutcome: 'سياق صالح وحيد',
      selectedCapabilities: ['قدرة سليمة', 42],
      optionalCapabilities: { unsafe: true },
      capabilitySelections: [
        { name: 'قدرة سليمة', classification: 'CORE', provenance: 'SYSTEM_SEEDED' },
        { name: 42, classification: 'CORE', provenance: 'USER_SELECTED' },
      ],
      capturedFacts: { outcome: 'سليم', activity: 42 },
      knownDependencies: 'not-an-array',
      budgetPreference: { unsafe: true },
    },
  }, 'partially-malformed-prefill');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('#sd-objective')).toHaveValue('سياق صالح وحيد');
  await expect(page.getByText('قدرة سليمة', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-carried-facts="true"]')).toHaveCount(0);
});

test('Start rejects contradictory same-name capability provenance without choosing a truth', async ({ page }) => {
  await navigateWithRouteState(page, {
    discoveryPrefill: {
      version: 1,
      selectedOutcome: 'سياق صالح مع قدرة متعارضة',
      capabilitySelections: [
        {
          name: 'قدرة متعارضة',
          classification: 'RECOMMENDED',
          provenance: 'SYSTEM_SEEDED',
        },
        {
          name: ' قدرة متعارضة ',
          classification: 'CUSTOM',
          provenance: 'USER_SELECTED',
        },
      ],
    },
  }, 'contradictory-capability-prefill');

  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('#sd-objective')).toHaveValue('سياق صالح مع قدرة متعارضة');
  await expect(page.getByText('قدرة متعارضة', { exact: true })).toHaveCount(0);
});

test('removing then re-adding a system recommendation records USER_SELECTED provenance', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await reachPortalRecommendation(page);
  await page.getByRole('button', { name: /تكوين الاتجاه/ }).click();

  const recommendedCapability = page
    .locator('.gsdw-capability.is-selected:not(.is-locked)')
    .filter({ hasText: /موصى/ })
    .first();
  await expect(recommendedCapability).toBeVisible();
  await expect(recommendedCapability.locator('small')).toContainText('موصى');
  const capabilityName = (await recommendedCapability.locator('strong').textContent())?.trim();
  expect(capabilityName).toBeTruthy();

  await recommendedCapability.click();
  await expect(recommendedCapability).not.toHaveClass(/is-selected/);
  await recommendedCapability.click();
  await expect(recommendedCapability).toHaveClass(/is-selected/);

  await page.getByRole('button', { name: /مقارنة اتجاه التكوين/ }).click();
  await page.getByRole('radio', { name: /ربط عدة مسارات مترابطة/ }).click();
  await page.getByRole('button', { name: /إضافة القيود والميزانية/ }).click();
  await page.getByRole('radio', { name: /مرونة حسب القيمة/ }).click();
  await page.getByText('عملية تشغيل قابلة للوصف', { exact: true }).click();
  await page.getByRole('button', { name: /إنتاج ملخص القرار/ }).click();
  await page.getByRole('button', { name: /تجهيز الانتقال إلى Discovery/ }).click();
  await expectRouteReady(page, '/start', '#start-discovery-title');

  const matchingSelections = await page.evaluate((selectedName) => {
    const routeState = window.history.state;
    const prefill = routeState?.usr?.discoveryPrefill ?? routeState?.discoveryPrefill;
    if (!Array.isArray(prefill?.capabilitySelections)) return [];
    return prefill.capabilitySelections.filter(
      (selection: { name?: unknown }) => selection?.name === selectedName,
    );
  }, capabilityName);
  expect(matchingSelections).toEqual([
    {
      name: capabilityName,
      classification: 'RECOMMENDED',
      provenance: 'USER_SELECTED',
    },
  ]);
});

test('Solutions semantic decision metadata keeps a 10px floor and normal-text contrast', async ({ page }) => {
  for (const [width, height] of [[1440, 900], [390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await reachSolutionsSummary(page);
    const selectors = [
      '.gsdw-summary-legend span',
      '.gsdw-summary-row > div:first-child em',
      '.gsdw-summary-row li > span',
      '.gsdw-summary-capabilities small',
      '.gsdw-evidence > strong',
    ];

    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      await expect(locator).toBeVisible();
      const metrics = await locator.evaluate((element) => {
        const parseRgb = (value: string) => {
          const parts = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
          return parts.map((part) => part / 255);
        };
        const luminance = (rgb: number[]) => {
          const linear = rgb.map((channel) =>
            channel <= 0.04045
              ? channel / 12.92
              : ((channel + 0.055) / 1.055) ** 2.4,
          );
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        };
        const style = getComputedStyle(element);
        let backgroundElement: Element | null = element;
        let backgroundColor = 'rgb(7, 16, 21)';
        while (backgroundElement) {
          const candidate = getComputedStyle(backgroundElement).backgroundColor;
          if (candidate && candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') {
            backgroundColor = candidate;
            break;
          }
          backgroundElement = backgroundElement.parentElement;
        }
        const foreground = luminance(parseRgb(style.color));
        const background = luminance(parseRgb(backgroundColor));
        return {
          fontSize: Number.parseFloat(style.fontSize),
          contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
        };
      });
      expect(metrics.fontSize).toBeGreaterThanOrEqual(10);
      expect(metrics.contrast).toBeGreaterThanOrEqual(4.5);
    }

    await expectNoHorizontalOverflow(page);
  }
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
      capabilitySelections: [
        { name: '', classification: 'CORE', provenance: 'SYSTEM_SEEDED' },
      ],
      capturedFacts: { outcome: 42 },
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
