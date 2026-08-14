import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const EVIDENCE_DIR = resolve(process.env.VISUAL_EVIDENCE_DIR ?? 'visual-evidence');

const PUBLIC_ROUTES = [
  { path: '/', label: 'الرئيسية', heading: null },
  { path: '/solutions', label: 'الحلول', heading: 'الحلول' },
  { path: '/reference-projects', label: 'المشاريع المرجعية', heading: 'المشاريع المرجعية' },
  { path: '/how-we-work', label: 'كيف نعمل', heading: 'كيف نعمل' },
  { path: '/start', label: 'ابدأ اختيارك', heading: 'ابدأ اختيارك' },
] as const;

async function collectRuntimeErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

test.beforeAll(async () => {
  await mkdir(EVIDENCE_DIR, { recursive: true });
});

for (const route of PUBLIC_ROUTES) {
  test(`supports direct entry and active navigation at ${route.path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route.path);
    await expect(page).toHaveURL(new RegExp(`${route.path === '/' ? '/$' : `${route.path}$`}`));

    if (route.heading) {
      const heading = page.getByRole('heading', { level: 1, name: route.heading });
      await expect(heading).toBeVisible();
      await expect(heading).toBeFocused();
    } else {
      await expect(page.locator('#hero')).toBeVisible();
      await expect(page.locator('#main-content')).toBeFocused();
    }

    const activeLink = route.path === '/start'
      ? page.locator('.hero-nav__contact')
      : page.locator('.hero-nav__links').getByRole('link', { name: route.label, exact: true });
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });
}

test('supports browser back, forward, and saved scroll restoration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await page.goto('/solutions');
  await expect(page.getByRole('heading', { level: 1, name: 'الحلول' })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 240));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(150);

  await page.evaluate(() => {
    const link = document.querySelector<HTMLAnchorElement>('.hero-nav__links a[href="/how-we-work"]');
    link?.click();
  });
  await expect(page).toHaveURL(/\/how-we-work$/);
  await expect(page.getByRole('heading', { level: 1, name: 'كيف نعمل' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(150);

  await page.goForward();
  await expect(page).toHaveURL(/\/how-we-work$/);
  await expect(page.getByRole('heading', { level: 1, name: 'كيف نعمل' })).toBeFocused();
});

test('mobile navigation supports keyboard operation, active state, and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/solutions');

  const toggle = page.getByRole('button', { name: 'فتح قائمة التنقل' });
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'إغلاق قائمة التنقل' })).toHaveAttribute('aria-expanded', 'true');

  const currentLink = page.locator('.hero-nav__mobile-panel').getByRole('link', { name: 'الحلول', exact: true });
  await expect(currentLink).toHaveAttribute('aria-current', 'page');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'فتح قائمة التنقل' })).toBeFocused();

  await page.keyboard.press('Enter');
  const projectsLink = page.locator('.hero-nav__mobile-panel').getByRole('link', { name: 'المشاريع المرجعية' });
  await projectsLink.focus();
  await expect(projectsLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/reference-projects$/);
  await expect(page.getByRole('heading', { level: 1, name: 'المشاريع المرجعية' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'فتح قائمة التنقل' })).toHaveAttribute('aria-expanded', 'false');
});

test('renders a recoverable branded 404 without dead links', async ({ page }) => {
  await page.goto('/route-that-does-not-exist');
  await expect(page.getByRole('heading', { level: 1, name: 'هذه الصفحة غير موجودة' })).toBeFocused();
  await expect(page).toHaveTitle('الصفحة غير موجودة | General Solutions');
  await page.getByRole('link', { name: 'العودة إلى الرئيسية' }).click();
  await expect(page).toHaveURL(/\/$/);

  const internalHrefs = await page.locator('a[href]').evaluateAll((links) => links
    .map((link) => link.getAttribute('href'))
    .filter((href): href is string => Boolean(href) && !href.startsWith('mailto:')));
  expect(internalHrefs).not.toContain('#');
  for (const href of internalHrefs) {
    if (href.startsWith('#')) {
      await expect(page.locator(href)).toHaveCount(1);
    } else {
      expect(href.startsWith('/')).toBe(true);
    }
  }
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`shell has no overflow or runtime errors at ${width}px`, async ({ page }) => {
    const errors = await collectRuntimeErrors(page);
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await page.goto('/solutions');
    await expect(page.getByRole('heading', { level: 1, name: 'الحلول' })).toBeVisible();

    if (width <= 800) {
      await page.getByRole('button', { name: 'فتح قائمة التنقل' }).click();
      await expect(page.locator('.hero-nav__mobile-panel')).toBeVisible();
    }

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });
}

test('captures W01 shell reference evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/solutions');
  await expect(page.getByRole('heading', { level: 1, name: 'الحلول' })).toBeVisible();
  await page.screenshot({
    path: resolve(EVIDENCE_DIR, 'w01-shell-solutions-1440.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/reference-projects');
  await page.getByRole('button', { name: 'فتح قائمة التنقل' }).click();
  await expect(page.locator('.hero-nav__mobile-panel')).toBeVisible();
  await page.screenshot({
    path: resolve(EVIDENCE_DIR, 'w01-shell-mobile-menu-390.png'),
    fullPage: false,
    animations: 'disabled',
  });
});
