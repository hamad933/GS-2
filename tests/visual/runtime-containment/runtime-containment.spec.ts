import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  { path: '/', heading: '#hero-title' },
  { path: '/solutions', heading: '#gsdw-entry-title' },
  { path: '/reference-projects', heading: '#reference-projects-title' },
  { path: '/how-we-work', heading: '#how-we-work-title' },
  { path: '/start', heading: '#start-discovery-title' },
] as const;

const externalFontHosts = ['fonts.googleapis.com', 'fonts.gstatic.com'];

type RuntimeEvidence = {
  consoleErrors: string[];
  pageErrors: string[];
  externalFontRequests: string[];
  failedRequests: string[];
  localFontResponses: string[];
};

const evidenceByPage = new WeakMap<Page, RuntimeEvidence>();

test.beforeEach(async ({ page }) => {
  const evidence: RuntimeEvidence = {
    consoleErrors: [],
    pageErrors: [],
    externalFontRequests: [],
    failedRequests: [],
    localFontResponses: [],
  };
  evidenceByPage.set(page, evidence);

  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => evidence.pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = request.url();
    if (externalFontHosts.some((host) => new URL(url).hostname === host)) {
      evidence.externalFontRequests.push(url);
    }
  });
  page.on('requestfailed', (request) => {
    evidence.failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? 'unknown'}`);
  });
  page.on('response', (response) => {
    const url = response.url();
    if (/\.woff2(?:\?|$)/.test(url)) {
      if (response.ok()) evidence.localFontResponses.push(url);
      else evidence.failedRequests.push(`${url} — HTTP ${response.status()}`);
    }
  });
});

test.afterEach(async ({ page }) => {
  const evidence = evidenceByPage.get(page);
  expect(evidence?.externalFontRequests ?? []).toEqual([]);
  expect(evidence?.consoleErrors ?? []).toEqual([]);
  expect(evidence?.pageErrors ?? []).toEqual([]);
  expect(evidence?.failedRequests ?? []).toEqual([]);
});

for (const route of publicRoutes) {
  test(`uses loaded local Arabic typography without font-network access at ${route.path}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const heading = page.locator(route.heading);
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS('font-family', /Noto Kufi Arabic/);
    await expect(heading).toHaveCSS('font-weight', '500');

    const fontContract = await heading.evaluate((element) => {
      const headingStyle = getComputedStyle(element);
      const bodyStyle = getComputedStyle(document.body);
      const sample = element.textContent?.trim() || 'العربية';

      return {
        bodyFamily: bodyStyle.fontFamily,
        notoLoaded: document.fonts.check(
          `${headingStyle.fontWeight} ${headingStyle.fontSize} "Noto Kufi Arabic"`,
          sample,
        ),
        plexLoaded: document.fonts.check('400 16px "IBM Plex Sans Arabic"', 'العربية General Solutions'),
      };
    });

    expect(fontContract.bodyFamily).toContain('IBM Plex Sans Arabic');
    expect(fontContract.notoLoaded).toBe(true);
    expect(fontContract.plexLoaded).toBe(true);
    expect(evidenceByPage.get(page)?.localFontResponses.length ?? 0).toBeGreaterThan(0);
  });
}

for (const width of [1440, 390]) {
  for (const route of ['/', '/solutions'] as const) {
    test(`keeps ${route} typography contained without overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    });
  }
}
