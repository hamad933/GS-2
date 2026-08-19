import { expect, test, type Locator, type Page } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, { console: string[]; page: string[] }>();

async function openHome(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#hero')).toHaveAttribute('data-stage', 'need');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
}

async function expectFocusVisualInsideViewport(locator: Locator) {
  const result = await locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const outlineWidth = Number.parseFloat(style.outlineWidth) || 0;
    const outlineOffset = Number.parseFloat(style.outlineOffset) || 0;
    const focusBleed = Math.max(0, outlineWidth + outlineOffset);

    return {
      left: rect.left - focusBleed,
      right: rect.right + focusBleed,
      viewportWidth: window.innerWidth,
      outlineStyle: style.outlineStyle,
      outlineWidth,
    };
  });

  expect(result.outlineStyle).not.toBe('none');
  expect(result.outlineWidth).toBeGreaterThan(0);
  expect(result.left).toBeGreaterThanOrEqual(0);
  expect(result.right).toBeLessThanOrEqual(result.viewportWidth);
}

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

test('Hero keeps deliberate focus, truthful brief authorship, and coherent Build actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);

  const hero = page.locator('#hero');
  const currentStage = hero.locator('.e2-stage-track [aria-current="step"] b');
  const activeBuildPhase = hero.locator('.e2-build-phases li[data-state="active"] strong');
  const firstNeed = hero.getByRole('button', { name: 'إطلاق خدمة رقمية', exact: true });

  await firstNeed.focus();
  await expect(firstNeed).toBeFocused();
  await firstNeed.press('Enter');

  const firstDirection = hero.getByRole('button', { name: 'خطوة رئيسية واحدة' });
  await expect(hero).toHaveAttribute('data-stage', 'direction');
  await expect(currentStage).toHaveText('الاتجاه');
  await expect(firstDirection).toBeFocused();
  await firstDirection.press('Enter');

  const arrange = hero.getByRole('button', { name: 'رتّب الرحلة حول الهدف', exact: true });
  await expect(hero).toHaveAttribute('data-stage', 'build');
  await expect(currentStage).toHaveText('البناء');
  await expect(activeBuildPhase).toHaveText('رتّب الرحلة حول الهدف');
  await expect(arrange).toBeFocused();
  await arrange.press('Enter');

  const unify = hero.getByRole('button', { name: 'وحّد التجربة', exact: true });
  await expect(activeBuildPhase).toHaveText('وحّد التجربة');
  await expect(unify).toBeFocused();
  await unify.press('Enter');

  const tryRoute = hero.getByRole('button', { name: 'جرّب المسار', exact: true });
  await expect(activeBuildPhase).toHaveText('جرّب المسار');
  await expect(tryRoute).toBeFocused();
  await tryRoute.press('Enter');

  const brief = hero.getByLabel('طلبك المختصر', { exact: true });
  const prepare = hero.getByRole('button', { name: 'جهّز الملخّص', exact: true });
  await expect(activeBuildPhase).toHaveText('جهّز الملخّص');
  await expect(brief).toBeFocused();
  await expect(brief).toHaveValue('');
  await expect(brief).toHaveAttribute('placeholder', 'اكتب باختصار ما تريد تحقيقه');
  await expect(prepare).toBeDisabled();

  await brief.fill('أحتاج تبسيط رحلة التسجيل');
  await page.keyboard.press('Tab');
  await expect(prepare).toBeFocused();
  await expect(prepare).toBeEnabled();
  await prepare.press('Enter');

  const launch = hero.locator('.e2-launch-chamber');
  await expect(hero).toHaveAttribute('data-stage', 'launch');
  await expect(currentStage).toHaveText('الإطلاق');
  await expect(launch).toBeFocused();
  await expect(hero).toContainText('لم يُرسل شيء بعد');
  await expect(hero).toContainText('لن يُرسل شيء تلقائيًا');
  await expect(page.locator('.skip-link')).not.toBeFocused();
});

test('S02 hover and focus preview without changing explicit selection', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await openHome(page);

  const solutions = page.locator('#solutions-universe');
  const commerce = solutions.locator('.s02-station-2');
  const portals = solutions.locator('.s02-station-5');

  await expect(solutions).toHaveAttribute('data-active', 'business');
  await commerce.hover();
  await expect(solutions).toHaveAttribute('data-active', 'business');
  await expect(solutions).toHaveAttribute('data-preview', 'commerce');
  await expect(commerce).toHaveAttribute('aria-pressed', 'false');

  await solutions.locator('.s02-narrative').hover();
  await expect(solutions).not.toHaveAttribute('data-preview', /.+/);
  await expect(solutions).toHaveAttribute('data-active', 'business');

  await portals.focus();
  await expect(portals).toBeFocused();
  await expect(solutions).toHaveAttribute('data-active', 'business');
  await expect(solutions).toHaveAttribute('data-preview', 'portals');
  await expect(portals).toHaveAttribute('aria-pressed', 'false');

  await portals.press('Enter');
  await expect(solutions).toHaveAttribute('data-active', 'portals');
  await expect(solutions).not.toHaveAttribute('data-preview', /.+/);
  await expect(portals).toHaveAttribute('aria-pressed', 'true');
});

for (const width of [430, 390]) {
  test(`S02 controls and focus indicators remain inside ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page);

    const solutions = page.locator('#solutions-universe');
    const controls = solutions.locator('.s02-station, .s02-actions a, .s02-actions button');
    const count = await controls.count();

    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index);
      await control.focus();
      await expect(control).toBeFocused();
      await expectFocusVisualInsideViewport(control);
    }

    const overflow = await solutions.evaluate(() => ({
      documentScrollWidth: document.documentElement.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.documentScrollWidth).toBeLessThanOrEqual(overflow.documentClientWidth);
  });
}

test('owned Hero and S02 motion remains reduced when the user requests it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 768, height: 900 });
  await openHome(page);

  for (const selector of ['#hero .e2-threshold-light', '#solutions-universe .s02-connector']) {
    const durations = await page.locator(selector).first().evaluate((element) => {
      return window.getComputedStyle(element).transitionDuration
        .split(',')
        .map((value) => value.trim());
    });

    expect(durations.every((value) => value === '0s' || value === '0.00001s')).toBe(true);
  }
});