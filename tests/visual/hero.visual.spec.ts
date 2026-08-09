import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const EVIDENCE_DIR = resolve('visual-evidence');
const HERO = '#hero';

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

  await page.getByRole('button', { name: 'رتّب الرحلة حول الهدف' }).press('Enter');
  await expect(hero).toHaveAttribute('data-build', '1');

  await page.getByRole('button', { name: 'وحّد التجربة' }).press('Enter');
  await expect(hero).toHaveAttribute('data-build', '2');

  await page.getByRole('button', { name: 'جرّب المسار' }).press('Enter');
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

function durationsToMilliseconds(value: string) {
  return value.split(',').map((duration) => {
    const trimmed = duration.trim();
    return trimmed.endsWith('ms') ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
  });
}

test.beforeAll(async () => {
  await mkdir(EVIDENCE_DIR, { recursive: true });
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
  await expect(page.getByText('تم الاستلام')).toBeVisible();
  await captureHero(page, 'desktop-k04-launch.png');
});

test('captures mobile K01 and K03 evidence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await captureHero(page, 'mobile-k01-need.png');

  await reachK03(page);
  await captureHero(page, 'mobile-k03-build.png');
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
