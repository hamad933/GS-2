import { expect, test, type Page } from '@playwright/test';
import { referenceProjects } from '../../../src/data/reference-projects';
import { solutionFamilies } from '../../../src/data/solutions';
import { mapSolutionsExplorationToDiscovery } from '../../../src/integration/solutionsToDiscovery';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';

const SOLUTIONS = '#solutions-exploration';
const REFERENCE_BODY = '.reference-projects-body';
const runtimeErrors = new WeakMap<Page, string[]>();

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) ?? []).toEqual([]);
});

test('preserves the canonical six solution families and underlying domain classifications', () => {
  expect(solutionFamilies.map(({ id, title }) => [id, title])).toEqual([
    ['business', 'مواقع الأعمال والخدمات'],
    ['commerce', 'التجارة الرقمية وتجارب العلامات'],
    ['booking', 'الحجوزات والخدمات'],
    ['assets', 'العقارات والأصول'],
    ['portals', 'الأنظمة التشغيلية والبوابات'],
    ['knowledge', 'التعليم والمعرفة والمحتوى'],
  ]);
  const classifications = new Set(
    solutionFamilies.flatMap((family) => family.capabilities.map((capability) => capability.classification)),
  );
  expect([...classifications].sort()).toEqual(['CONDITIONAL', 'CORE', 'CUSTOM', 'OPTIONAL', 'RECOMMENDED']);
});

test('renders the six-family Arabic exploration without exposing configurator classifications', async ({ page }) => {
  await open(page, '/solutions');
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('tab')).toHaveCount(6);
  for (const family of solutionFamilies) {
    await expect(page.getByRole('tab', { name: new RegExp(family.title) })).toBeVisible();
  }
  await expect(page.getByText(/Capability Builder|Project Pulse|START stages/)).toHaveCount(0);
  await expect(page.getByText(/CORE|RECOMMENDED|OPTIONAL/, { exact: false })).toHaveCount(0);
});

test('selected-family semantics present fit, users, operation, product forms, orientation, and bounded reference truth', async ({ page }) => {
  await open(page, '/solutions');
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { name: 'الحجوزات والخدمات', exact: true })).toBeVisible();
  await expect(panel.getByText('متى يناسبني هذا النوع؟')).toBeVisible();
  await expect(panel.getByText('من يستخدمه؟')).toBeVisible();
  await expect(panel.getByText('كيف يعمل؟')).toBeVisible();
  await expect(panel.getByText('ما الذي يمكن أن يتضمنه؟')).toBeVisible();
  await expect(panel.getByText('أشكال ممكنة يمكن أن يأخذها الحل')).toBeVisible();
  await expect(panel.getByText(/ليست قوالب أو باقات أو منتجات جاهزة للبيع/)).toBeVisible();
  await expect(panel.getByText(/ليس عرض سعر/)).toBeVisible();
  await expect(panel.getByText('RP-03 — Booking & Service Operations')).toBeVisible();
  await expect(panel.locator('[data-asset-id="FAM-03-MSC-01"]')).toBeVisible();
  await expect(panel.locator('[data-asset-id^="FAM-03-DIR-"]')).toHaveCount(3);
});

test('exploration handoff keeps START v1 provenance without fabricating customer facts or configuration', () => {
  expect(mapSolutionsExplorationToDiscovery('booking', 'USER_DIRECT')).toEqual({
    version: START_DISCOVERY_PREFILL_VERSION,
    source: {
      adapter: 'solutions-exploration',
      label: 'استكشاف الحلول',
      referenceId: 'booking',
    },
    solutionFamilyId: 'booking',
    decisionOrigin: 'USER_DIRECT',
  });
  expect(mapSolutionsExplorationToDiscovery('portals', 'USER_COMPARE')).toEqual({
    version: START_DISCOVERY_PREFILL_VERSION,
    source: {
      adapter: 'solutions-exploration',
      label: 'استكشاف الحلول',
      referenceId: 'portals',
    },
    solutionFamilyId: 'portals',
    decisionOrigin: 'USER_COMPARE',
  });
});

test('compare preserves the booking-versus-operations distinction without becoming a feature matrix', async ({ page }) => {
  await open(page, '/solutions');
  await page.getByRole('button', { name: 'قارن الحجوزات بالتشغيل' }).click();
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('data-mode', 'compare');
  await expect(page.getByText('رحلة العميل إلى الخدمة والموعد')).toBeVisible();
  await expect(page.getByText('عمل الفريق والطلبات والسجلات')).toBeVisible();
  await expect(page.locator('.solutions-compare-row')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'ابدأ من الحجوزات والخدمات' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ابدأ من الأنظمة التشغيلية والبوابات' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'لم أحسم بعد — ارجع إلى جميع الحلول' })).toBeVisible();
});

test('family browser is keyboard-operable and selection is not color-only', async ({ page }) => {
  await open(page, '/solutions');
  const booking = page.getByRole('tab', { name: /الحجوزات والخدمات/ });
  await booking.focus();
  await expect(booking).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const assets = page.getByRole('tab', { name: /العقارات والأصول/ });
  await expect(assets).toBeFocused();
  await expect(assets).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(SOLUTIONS)).toHaveAttribute('data-family', 'assets');
});

test('preserves exact RP identities, independent state, and absent outbound routes', () => {
  expect(referenceProjects.map((project) => `${project.code} — ${project.name} / ${project.domain.en}`)).toEqual([
    'RP01 — Bayt & Style / Commerce & Fulfillment',
    'RP02 — Enterprise Operations & Control / Enterprise Operations & Control',
    'RP03 — Booking & Service Operations / Booking & Service Operations',
    'RP04 — Real Estate & Asset Lifecycle / Real Estate & Asset Lifecycle',
  ]);
  expect(referenceProjects.every((project) => project.outboundRoute === null)).toBe(true);
  expect(referenceProjects.every((project) => (
    project.evidence.map((item) => item.state).join(',') === 'REFERENCE_ONLY,UNAVAILABLE,UNAVAILABLE'
  ))).toBe(true);
});

test('renders localized reference truth first while retaining machine state as secondary metadata', async ({ page }) => {
  await open(page, '/reference-projects');
  await expect(page.locator(REFERENCE_BODY)).toHaveAttribute('dir', 'rtl');
  for (const projectId of ['rp01', 'rp02', 'rp03', 'rp04']) {
    await page.locator(`[data-project-selector="${projectId}"]`).click();
    const toggle = page.getByRole('button', { name: /سجل الحدود والتحقق/ });
    await toggle.click();
    await expect(page.locator('.rp-ledger__evidence .rp-state-label[data-state="REFERENCE_ONLY"] > strong')).toHaveText('مرجع سياقي فقط');
    await expect(page.locator('.rp-ledger__route .rp-state-label[data-state="ROUTE_NOT_CONFIGURED"] > strong')).toHaveText('الرابط المرجعي غير مهيأ بعد');
  }
  await expect(page.locator(`${REFERENCE_BODY} a[href]`)).toHaveCount(0);
});

test('renders natural English reference labels and preserves LTR identifiers', async ({ page }) => {
  await open(page, '/tests/visual/fixtures/reference-projects/index.html?locale=en');
  await expect(page.locator(REFERENCE_BODY)).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('[data-project-selector="rp02"]')).toContainText('Enterprise Operations & Control');
  await page.locator('[data-project-selector="rp02"]').click();
  await page.getByRole('button', { name: /boundaries and verification ledger/i }).click();
  await expect(page.locator('.rp-state-label[data-state="REFERENCE_ONLY"] > strong').first()).toHaveText('Contextual reference only');
  await expect(page.locator('.rp-project-selector__code').first()).toHaveCSS('direction', 'ltr');
});

test('preserves Reference Projects keyboard focus and deliberate RTL/LTR direction', async ({ page }) => {
  await open(page, '/reference-projects');
  const routeFocus = page.locator('[data-route-focus]');
  if (await routeFocus.count()) await expect(routeFocus).toBeFocused();
  const first = page.locator('[data-project-selector="rp01"]');
  await first.focus();
  await expect(first).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-project-selector="rp02"]')).toBeFocused();
  await expect(page.locator(REFERENCE_BODY)).toHaveAttribute('data-active-project', 'rp02');
  await expect(page.locator('.rp-project-selector__code').first()).toHaveCSS('direction', 'ltr');
  await expect(page.locator('[data-project-selector="rp02"]')).toHaveCSS('outline-style', 'solid');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`has no overflow or runtime errors in public semantic states at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : width <= 430 ? 844 : 900 });
    await open(page, '/solutions');
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'قارن الحجوزات بالتشغيل' }).click();
    await expectNoHorizontalOverflow(page);
    await open(page, '/reference-projects');
    await page.locator('[data-project-selector="rp04"]').click();
    await page.getByRole('button', { name: /سجل الحدود والتحقق/ }).click();
    await expectNoHorizontalOverflow(page);
  });
}
