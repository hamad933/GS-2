import { expect, test, type Locator, type Page } from '@playwright/test';

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
  await expect(page.locator('#main-content')).toBeFocused();
}

async function expectFontAtLeast(locator: Locator, minimumPx: number) {
  const fontSize = await locator.evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(minimumPx);
}

function cssTimeToMilliseconds(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.endsWith('ms')) return Number.parseFloat(normalized);
  if (normalized.endsWith('s')) return Number.parseFloat(normalized) * 1000;
  throw new Error(`Unsupported CSS time value: ${value}`);
}

for (const width of [1440, 768]) {
  test(`S03 preserves explicit pointer, keyboard, focus-only, and programmatic activation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await openHome(page);

    const proof = page.locator('#reference-proof');
    const initialSelectors = proof.locator('[data-project-selector]');
    await expect(initialSelectors).toHaveCount(3);
    expect(await initialSelectors.evaluateAll((buttons) => buttons.every((button) => !button.hasAttribute('aria-pressed')))).toBe(true);

    const rp02 = proof.locator('[data-project-selector="rp02"]');
    await rp02.focus();
    await expect(rp02).toBeFocused();
    await expect(proof).toHaveAttribute('data-project', 'rp01');

    await rp02.press('Enter');
    await expect(proof).toHaveAttribute('data-project', 'rp02');

    const rp01 = proof.locator('[data-project-selector="rp01"]');
    await rp01.focus();
    await expect(proof).toHaveAttribute('data-project', 'rp02');
    await rp01.press('Space');
    await expect(proof).toHaveAttribute('data-project', 'rp01');

    await proof.locator('[data-project-selector="rp04"]').click();
    await expect(proof).toHaveAttribute('data-project', 'rp04');

    await proof.locator('[data-project-selector="rp03"]').evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    await expect(proof).toHaveAttribute('data-project', 'rp03');
  });
}

for (const width of [430, 390]) {
  test(`HOME-B mobile composition remains readable and decision-forward at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openHome(page);

    const proof = page.locator('#reference-proof');
    const disclosure = proof.locator('[data-visible-evidence-boundary]');
    const narrative = proof.locator('.reference-proof-v2__narrative');
    const theatre = proof.locator('.project-media');

    await expect(disclosure).toBeVisible();
    await expect(disclosure).toContainText('توضيحية وغير توثيقية');

    const [disclosureBox, narrativeBox, theatreBox] = await Promise.all([
      disclosure.boundingBox(),
      narrative.boundingBox(),
      theatre.boundingBox(),
    ]);
    expect(disclosureBox).not.toBeNull();
    expect(narrativeBox).not.toBeNull();
    expect(theatreBox).not.toBeNull();
    expect((narrativeBox?.y ?? 0) + (narrativeBox?.height ?? 0)).toBeLessThanOrEqual((disclosureBox?.y ?? 0) + 1);
    expect((disclosureBox?.y ?? 0) + (disclosureBox?.height ?? 0)).toBeLessThanOrEqual((theatreBox?.y ?? 0) + 1);

    await expectFontAtLeast(disclosure, 11);
    await expectFontAtLeast(proof.locator('.reference-proof-v2__intro'), 11);
    await expectFontAtLeast(proof.locator('.reference-proof-v2__project-copy > p:last-child'), 11);
    await expectFontAtLeast(proof.locator('.reference-proof-v2__selector-title').first(), 11);
    await expectFontAtLeast(proof.locator('.reference-proof-v2__selector-family').first(), 11.5);

    const gateway = page.locator('#project-gateway');
    const gatewayHeading = gateway.locator('#gateway-title');
    const gatewayIntro = gateway.locator('.gateway-intro');
    const gatewayActions = gateway.locator('.gateway-actions');
    const gatewayPrimary = gateway.locator('.gateway-cta--primary');
    const gatewaySecondary = gateway.locator('.gateway-cta--secondary');
    const gatewayPrivacy = gateway.locator('.gateway-privacy');
    const gatewayContinuity = gateway.locator('.gateway-continuity');

    await expect(gatewayHeading).toBeVisible();
    await expect(gatewayIntro).toBeVisible();
    await expect(gatewayPrimary).toBeVisible();
    await expect(gatewaySecondary).toBeVisible();
    await expect(gatewayPrivacy).toBeVisible();
    await expect(gatewayContinuity).toBeVisible();

    const gatewayCtas = gatewayActions.locator('.gateway-cta');
    await expect(gatewayCtas).toHaveCount(2);
    await expect(gatewayCtas.nth(0)).toHaveClass(/gateway-cta--primary/);
    await expect(gatewayCtas.nth(1)).toHaveClass(/gateway-cta--secondary/);

    const [
      gatewayBox,
      headingBox,
      introBox,
      actionsBox,
      gatewayPrimaryBox,
      gatewaySecondaryBox,
      privacyBox,
      continuityBox,
    ] = await Promise.all([
      gateway.boundingBox(),
      gatewayHeading.boundingBox(),
      gatewayIntro.boundingBox(),
      gatewayActions.boundingBox(),
      gatewayPrimary.boundingBox(),
      gatewaySecondary.boundingBox(),
      gatewayPrivacy.boundingBox(),
      gatewayContinuity.boundingBox(),
    ]);

    expect(gatewayBox).not.toBeNull();
    expect(headingBox).not.toBeNull();
    expect(introBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(gatewayPrimaryBox).not.toBeNull();
    expect(gatewaySecondaryBox).not.toBeNull();
    expect(privacyBox).not.toBeNull();
    expect(continuityBox).not.toBeNull();

    if (
      !gatewayBox || !headingBox || !introBox || !actionsBox || !gatewayPrimaryBox
      || !gatewaySecondaryBox || !privacyBox || !continuityBox
    ) {
      throw new Error('Gateway mobile composition boxes must be measurable');
    }

    expect(gatewayBox.height).toBeLessThanOrEqual(770);

    const rootFontSize = await page.evaluate(() => Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize));
    const actionMarginBlockStart = await gatewayActions.evaluate((element) => (
      Number.parseFloat(window.getComputedStyle(element).marginBlockStart)
    ));
    const narrativeToActionsGap = actionsBox.y - (introBox.y + introBox.height);

    expect(actionMarginBlockStart).toBeLessThanOrEqual(rootFontSize * 1.5);
    expect(narrativeToActionsGap).toBeGreaterThanOrEqual(-1);
    expect(narrativeToActionsGap).toBeLessThanOrEqual(actionMarginBlockStart + 2);

    expect(introBox.y + introBox.height).toBeLessThanOrEqual(actionsBox.y + 1);
    expect(actionsBox.y + actionsBox.height).toBeLessThanOrEqual(privacyBox.y + 1);
    expect(actionsBox.y + actionsBox.height).toBeLessThanOrEqual(continuityBox.y + 1);
    expect(gatewayPrimaryBox.y).toBeLessThan(gatewaySecondaryBox.y);

    const gatewayRight = gatewayBox.x + gatewayBox.width;
    const gatewayBottom = gatewayBox.y + gatewayBox.height;
    for (const box of [headingBox, introBox, actionsBox, gatewayPrimaryBox, gatewaySecondaryBox, privacyBox, continuityBox]) {
      expect(box.x).toBeGreaterThanOrEqual(gatewayBox.x - 1);
      expect(box.y).toBeGreaterThanOrEqual(gatewayBox.y - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(gatewayRight + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(gatewayBottom + 1);
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    }

    const footer = page.locator('.gs-footer');
    await expect(footer.getByRole('link', { name: 'ابدأ اختيارك', exact: true })).toHaveCount(1);
    const footerStartAction = footer.getByRole('link', { name: 'انتقل إلى نقطة البدء', exact: true });
    await expect(footerStartAction).toHaveCount(1);
    await expect(footerStartAction).toHaveAttribute('href', '/start');

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });
}

test('HOME-B scoped interactions preserve reduced-motion behavior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);

  for (const selector of [
    '#reference-proof .reference-proof-v2__selectors button',
    '#project-gateway .gateway-cta--primary',
  ]) {
    const durations = await page.locator(selector).first().evaluate((element) => (
      window.getComputedStyle(element).transitionDuration.split(',')
    ));
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations) {
      expect(cssTimeToMilliseconds(duration)).toBeLessThanOrEqual(0.01);
    }
  }
});
