import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const EVIDENCE_DIR = resolve('visual-evidence');
const HERO = '#hero';
const S02 = '#solutions-universe';
const S03 = '#reference-proof';
const S04 = '#system-anatomy';
const S05 = '#project-gateway';
const FOOTER = 'footer:has-text("© 2026 General Solutions")';

async function openHome(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'need');
}

async function reachK03(page: Page) {
  const hero = page.locator(HERO);

  await page.getByRole('button', { name: 'إطلاق خدمة رقمية' }).click();
  await expect(hero).toHaveAttribute('data-stage', 'direction');

  await page.getByRole('button', { name: 'خطوة رئيسية واحدة' }).click();
  await expect(hero).toHaveAttribute('data-stage', 'build');
  await expect(hero).toHaveAttribute('data-build', '0');

  await page.getByRole('button', { name: 'رتّب الرحلة حول الهدف' }).click();
  await expect(hero).toHaveAttribute('data-build', '1');

  await page.getByRole('button', { name: 'وحّد التجربة' }).click();
  await expect(hero).toHaveAttribute('data-build', '2');

  await page.getByRole('button', { name: 'جرّب المسار' }).click();
  await expect(hero).toHaveAttribute('data-build', '3');
  await expect(page.getByLabel('طلبك المختصر')).toBeVisible();
}

async function captureHero(page: Page, filename: string) {
  await page.waitForTimeout(900);
  await page.locator(HERO).screenshot({
    path: resolve(EVIDENCE_DIR, filename),
    animations: 'disabled',
  });
}

async function captureSection(page: Page, selector: string, filename: string) {
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await section.screenshot({ path: resolve(EVIDENCE_DIR, filename), animations: 'disabled' });
}

async function captureFullPage(page: Page, filename: string) {
  await page.screenshot({ path: resolve(EVIDENCE_DIR, filename), fullPage: true, animations: 'disabled' });
}

async function captureTransition(page: Page, firstSelector: string, secondSelector: string, filename: string) {
  const first = page.locator(firstSelector);
  const second = page.locator(secondSelector);
  await expect(first).toHaveCount(1);
  await expect(second).toHaveCount(1);

  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Viewport size is unavailable for transition capture');

  await second.evaluate((element) => {
    const boundary = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, boundary - window.innerHeight / 2), behavior: 'auto' });
  });
  await page.waitForTimeout(150);
  await page.screenshot({
    path: resolve(EVIDENCE_DIR, filename),
    animations: 'disabled',
  });
}

function durationsToMilliseconds(value: string) {
  return value.split(',').map((duration) => {
    const trimmed = duration.trim();
    return trimmed.endsWith('ms') ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
  });
}

test.beforeAll(async () => {
  await mkdir(EVIDENCE_DIR, { recursive: true });
});

test('captures W05 V2-A Hero states through the real pointer journey', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await captureHero(page, 'desktop-w05-v2-a-hero-k01.png');

  await page.getByRole('button', { name: 'إطلاق خدمة رقمية' }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'direction');
  await captureHero(page, 'desktop-w05-v2-a-hero-k02.png');

  await page.getByRole('button', { name: 'خطوة رئيسية واحدة' }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'build');
  await page.getByRole('button', { name: 'رتّب الرحلة حول الهدف' }).click();
  await page.getByRole('button', { name: 'وحّد التجربة' }).click();
  await page.getByRole('button', { name: 'جرّب المسار' }).click();
  await expect(page.getByLabel('طلبك المختصر')).toBeVisible();
  await captureHero(page, 'desktop-w05-v2-a-hero-k03.png');

  await page.getByLabel('طلبك المختصر').fill('طلب توضيحي لمراجعة جاهزية المسار');
  await page.getByRole('button', { name: /إرسال الطلب/ }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'launch');
  await captureHero(page, 'desktop-w05-v2-a-hero-k04.png');
});

test('Hero journey supports keyboard activation with visible focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const need = page.getByRole('button', { name: 'إطلاق خدمة رقمية' });
  await need.focus();
  await expect(need).toBeFocused();
  await expect(need).toHaveCSS('box-shadow', /rgb/);
  await page.keyboard.press('Enter');
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'direction');

  const direction = page.getByRole('button', { name: 'خطوة رئيسية واحدة' });
  await direction.focus();
  await expect(direction).toBeFocused();
  await expect(direction).toHaveCSS('box-shadow', /rgb/);
  await page.keyboard.press('Space');
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'build');
});

test('captures desktop K01, K03, and K04 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await captureHero(page, 'desktop-k01-need.png');

  await reachK03(page);
  await captureHero(page, 'desktop-k03-build.png');

  await page.getByLabel('طلبك المختصر').fill('طلب توضيحي لاختبار التسليم');
  await page.getByRole('button', { name: /إرسال الطلب/ }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'launch');
  await expect(page.getByText('لم يُرسل شيء بعد؛ ستبقى المراجعة والإرسال بين يديك.')).toBeVisible();
  await captureHero(page, 'desktop-k04-launch.png');
});

test('captures mobile K01 and K03 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await captureHero(page, 'mobile-k01-need.png');

  await reachK03(page);
  await captureHero(page, 'mobile-k03-build.png');
});

test('captures desktop S02 and S03 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await captureSection(page, S02, 'desktop-s02-default.png');

  await page.locator(S02).getByRole('button', { name: /الأنظمة التشغيلية والبوابات/ }).click();
  await expect(page.locator(S02)).toHaveAttribute('data-active', 'portals');
  await captureSection(page, S02, 'desktop-s02-active.png');

  await captureSection(page, S03, 'desktop-s03-proof.png');
});

test('captures mobile S02 and S03 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await page.locator(S02).getByRole('button', { name: /العقارات والأصول/ }).click();
  await expect(page.locator(S02)).toHaveAttribute('data-active', 'assets');
  await captureSection(page, S02, 'mobile-s02-active.png');

  await page.locator(S03).getByRole('button', { name: /Enterprise Operations/ }).click();
  await expect(page.locator(S03)).toHaveAttribute('data-project', 'rp02');
  await captureSection(page, S03, 'mobile-s03-proof.png');
});

test('captures desktop S04 and S05 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await captureSection(page, S04, 'desktop-s04-anatomy-default.png');
  await page.locator(S04).getByRole('button', { name: /البناء/ }).click();
  await expect(page.locator(S04)).toHaveAttribute('data-active', 'build');
  await captureSection(page, S04, 'desktop-s04-anatomy-active.png');
  await captureSection(page, S05, 'desktop-s05-gateway.png');
});

test('captures mobile S04 and S05 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await page.locator(S04).getByRole('button', { name: /التكامل/ }).click();
  await expect(page.locator(S04)).toHaveAttribute('data-active', 'integration');
  await captureSection(page, S04, 'mobile-s04-anatomy.png');
  await captureSection(page, S05, 'mobile-s05-gateway.png');
});

test('honors prefers-reduced-motion in Chromium', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);

  const motionState = await page.locator('.product-surface').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration,
      scrollBehavior: style.scrollBehavior,
    };
  });

  expect(motionState.mediaMatches).toBe(true);
  expect(durationsToMilliseconds(motionState.transitionDuration).every((duration) => duration <= 0.02)).toBe(true);
  expect(durationsToMilliseconds(motionState.animationDuration).every((duration) => duration <= 0.02)).toBe(true);
  expect(motionState.scrollBehavior).toBe('auto');

  await page.getByRole('button', { name: 'إطلاق خدمة رقمية' }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'direction');
});

for (const width of [390, 768, 1024, 1440]) {
  test(`has no document horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page);
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}

test('all homepage hash links resolve and no active link uses a bare hash', async ({ page }) => {
  await openHome(page);
  const links = await page.locator('a[href^="#"]').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
  expect(links).not.toContain('#');
  for (const href of links) {
    expect(href).toBeTruthy();
    expect(await page.locator(href!).count()).toBe(1);
  }
});

test('representative controls support real clicks, keyboard activation, and synchronized state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await reachK03(page);
  await page.getByLabel('طلبك المختصر').fill('طلب توضيحي لاختبار التسليم');
  await page.getByRole('button', { name: /إرسال الطلب/ }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'launch');

  const family = page.locator(S02).getByRole('button', { name: /الأنظمة التشغيلية والبوابات/ });
  await family.click();
  await expect(family).toHaveAttribute('aria-pressed', 'true');
  await family.focus();
  await expect(family).toBeFocused();

  const project = page.locator(S03).getByRole('button', { name: /Enterprise Operations/ });
  await project.click();
  await expect(page.locator(S03)).toHaveAttribute('data-project', 'rp02');
  await expect(page.locator(S03).locator('.project-index button')).toHaveCount(3);

  const layer = page.locator(S04).getByRole('button', { name: /التكامل/ });
  await layer.click();
  await expect(layer).toHaveAttribute('aria-pressed', 'true');
  await layer.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(S04)).toHaveAttribute('data-active', 'integration');

  const gateway = page.locator(S05).getByRole('link', { name: 'ابدأ مشروعك' });
  await expect(gateway).toHaveAttribute('href', /^mailto:hello@generalsolutions\.co\?/);
});

test('captures final R3 desktop integration evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await captureFullPage(page, 'desktop-w05-r3-home-full.png');
  await captureTransition(page, HERO, S02, 'desktop-s01-s02-transition.png');
  await captureTransition(page, S03, S04, 'desktop-s03-s04-transition.png');
  await captureTransition(page, S05, FOOTER, 'desktop-s05-footer.png');
});

test('captures final R3 tablet integration evidence', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openHome(page);
  await captureFullPage(page, 'tablet-w05-r3-home-full.png');
});

test('captures final R3 mobile integration evidence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await captureFullPage(page, 'mobile-w05-r3-home-full.png');
  await captureTransition(page, S03, S04, 'mobile-s03-s04-transition.png');
  await captureTransition(page, S05, FOOTER, 'mobile-s05-footer.png');
});

test('captures complete W05-R3 review evidence with real pointer interactions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await captureHero(page, 'desktop-w05-r3-hero-need.png');
  await page.getByRole('button', { name: 'إطلاق خدمة رقمية' }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'direction');
  await captureHero(page, 'desktop-w05-r3-hero-direction.png');
  await page.getByRole('button', { name: 'ابدأ بحاجة أخرى' }).click();
  await reachK03(page);
  await captureHero(page, 'desktop-w05-r3-hero-build.png');
  await page.getByLabel('طلبك المختصر').fill('طلب توضيحي لمراجعة التفاعل');
  await page.getByRole('button', { name: /إرسال الطلب/ }).click();
  await expect(page.locator(HERO)).toHaveAttribute('data-stage', 'launch');
  await captureHero(page, 'desktop-w05-r3-hero-launch.png');

  await captureSection(page, S02, 'desktop-w05-r3-solutions-default.png');
  await page.locator(S02).getByRole('button', { name: /التجارة الرقمية وتجارب العلامات/ }).click();
  await page.locator(S02).getByRole('button', { name: /الأنظمة التشغيلية والبوابات/ }).click();
  await expect(page.locator(S02)).toHaveAttribute('data-active', 'portals');
  await captureSection(page, S02, 'desktop-w05-r3-solutions-active.png');

  await page.locator(S03).getByRole('button', { name: /Enterprise Operations/ }).click();
  await page.locator(S03).getByRole('button', { name: /Bayt & Style/ }).click();
  await captureSection(page, S03, 'desktop-w05-r3-project-rp01.png');
  await page.locator(S03).getByRole('button', { name: /Enterprise Operations/ }).click();
  await expect(page.locator(S03)).toHaveAttribute('data-project', 'rp02');
  await captureSection(page, S03, 'desktop-w05-r3-project-rp02.png');
  await page.locator(S03).getByRole('button', { name: /Booking & Services/ }).click();

  await page.locator(S04).getByRole('button', { name: /التكامل/ }).click();
  await expect(page.locator(S04)).toHaveAttribute('data-active', 'integration');
  await captureSection(page, S04, 'desktop-w05-r3-anatomy-active.png');
  await captureSection(page, S05, 'desktop-w05-r3-gateway.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await reachK03(page);
  await captureHero(page, 'mobile-w05-r3-hero-build.png');
  await page.locator(S02).getByRole('button', { name: /العقارات والأصول/ }).click();
  await captureSection(page, S02, 'mobile-w05-r3-solutions-active.png');
  await page.locator(S03).getByRole('button', { name: /Booking & Services/ }).click();
  await captureSection(page, S03, 'mobile-w05-r3-project.png');
  await page.locator(S04).getByRole('button', { name: /البناء/ }).click();
  await captureSection(page, S04, 'mobile-w05-r3-anatomy.png');
  await captureSection(page, S05, 'mobile-w05-r3-gateway.png');
});
