import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { referenceProjects as homepageReferenceProjects } from '../../../src/data/homeShowcase';
import { referenceProjectMedia } from '../../../src/data/referenceProjectMedia';
import { referenceProjects as canonicalReferenceProjects } from '../../../src/data/reference-projects/referenceProjects';

const S03 = '#reference-proof';
const FOOTER = '.gs-footer';
const EVIDENCE_DIR = resolve(
  process.env.VISUAL_EVIDENCE_DIR ?? 'visual-evidence',
  'gs-pages-w08-b',
);

async function openHome(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page.locator(S03)).toBeVisible();
}

async function captureRegion(page: Page, selector: string, filename: string) {
  const region = page.locator(selector);
  await region.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await region.screenshot({
    path: resolve(EVIDENCE_DIR, filename),
    animations: 'disabled',
  });
}

test.beforeAll(async () => {
  await mkdir(EVIDENCE_DIR, { recursive: true });
});

test('Homepage RP identities exactly match the canonical Reference Projects authority', () => {
  const homepageIdentities = homepageReferenceProjects.map((project) => ({
    id: project.id,
    code: project.index,
    name: project.family,
  }));
  const canonicalIdentities = canonicalReferenceProjects.map((project) => ({
    id: project.id,
    code: project.code,
    name: project.name,
  }));

  expect(homepageIdentities).toEqual(canonicalIdentities);
  expect(homepageIdentities.map((project) => `${project.code} — ${project.name}`)).toEqual([
    'RP01 — Bayt & Style',
    'RP02 — Enterprise Operations & Control',
    'RP03 — Booking & Service Operations',
    'RP04 — Real Estate & Asset Lifecycle',
  ]);
});

test('empty RP media renders explicit illustrative, non-evidentiary placeholders', async ({ page }) => {
  expect(referenceProjectMedia).toEqual({
    rp01: {},
    rp02: {},
    rp03: {},
    rp04: {},
  });

  await openHome(page);
  const figure = page.locator(S03).locator('.project-media');
  await expect(figure).toHaveAttribute('data-evidence', 'contains-illustrative-placeholders');
  await expect(figure.locator('figcaption')).toContainText('تصورات توضيحية غير توثيقية');
  await expect(figure.locator('figcaption')).toContainText('لا تمثل لقطات من المنتج أو دليلًا عليه');
  await expect(figure.locator('img')).toHaveCount(0);

  const placeholders = figure.locator('[data-evidence="illustrative-placeholder"]');
  await expect(placeholders).toHaveCount(3);
  const labels = await placeholders.evaluateAll((elements) => (
    elements.map((element) => element.getAttribute('aria-label') ?? '')
  ));

  for (const label of labels) {
    expect(label).toContain('تصور توضيحي غير توثيقي');
    expect(label).toContain('ليس لقطة من المنتج ولا دليلًا عليه');
  }
  expect(labels.join(' ')).not.toMatch(/سطح المنتج|واجهة المنتج|لقطة منتج موثقة|لقطة منتج معتمدة/);
  await expect(figure.locator('.neutral-project-surface__context').first()).toHaveText(
    'تصور توضيحي · غير توثيقي',
  );
});

test('S03 pointer and keyboard selection keep deterministic post-selection focus', async ({ page }) => {
  await openHome(page);
  const proof = page.locator(S03);

  const rp04Pointer = proof.locator('[data-project-selector="rp04"]');
  await expect(rp04Pointer).toHaveCount(1);
  await rp04Pointer.click();
  await expect(proof).toHaveAttribute('data-project', 'rp04');
  await expect(proof.locator('[data-project-selector="rp04"]')).toHaveCount(0);

  const rp02Keyboard = proof.locator('[data-project-selector="rp02"]');
  await expect(rp02Keyboard).toHaveCount(1);
  await rp02Keyboard.focus();
  await expect(rp02Keyboard).toBeFocused();
  await rp02Keyboard.press('Space');

  await expect(proof).toHaveAttribute('data-project', 'rp02');
  await expect(proof.locator('[data-project-selector="rp02"]')).toHaveCount(0);
  const deterministicFocusTarget = proof.locator('[data-project-selector="rp01"]');
  await expect(deterministicFocusTarget).toBeFocused();
  await expect(deterministicFocusTarget).toHaveClass(/is-keyboard-focus/);
});

test('Footer exposes no unverified mailto and routes its public action to Start with destination focus', async ({ page }) => {
  await openHome(page);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);

  const footer = page.locator(FOOTER);
  const action = footer.getByRole('link', { name: 'ابدأ اختيارك', exact: true });
  await expect(action).toHaveCount(1);
  await expect(action).toHaveAttribute('href', '/start');
  await action.focus();
  await expect(action).toBeFocused();
  await action.press('Enter');

  await expect(page).toHaveURL(/\/start$/);
  await expect(page.locator('#start-discovery-title')).toBeFocused();
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`captures W08-B affected S03 and Footer regions at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({
      width,
      height: width === 768 ? 1024 : width <= 430 ? 844 : 900,
    });
    await openHome(page);

    const proof = page.locator(S03);
    await proof.locator('[data-project-selector="rp02"]').click();
    await expect(proof).toHaveAttribute('data-project', 'rp02');
    await captureRegion(page, S03, `after-${width}-s03-reference-proof.png`);
    await captureRegion(page, FOOTER, `after-${width}-footer.png`);
  });
}
