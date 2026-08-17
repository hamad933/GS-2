import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { familyVisualAssets } from '../../../src/data/visual/familyVisualAssets';
import { createStartDiscoveryDraft } from '../../../src/features/start-discovery/discoveryModel';
import { readStartDiscoveryRouteState } from '../../../src/routes/startDiscoveryRouteState';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';

const previewPath = './';
const evidenceDirectory = resolve(
  process.env.START_DISCOVERY_EVIDENCE_DIR ?? 'test-results/visual-evidence/gs-final-public-w01-start',
);

async function openStart(page: Page, query = '') {
  await page.goto(previewPath);
  await page.evaluate(() => window.sessionStorage.removeItem('gs-start-frozen-product-v1'));
  await page.goto(`${previewPath}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.start-discovery')).toBeVisible();
  await expect(page.locator('#start-discovery-title')).toBeFocused();
}

async function chooseDiscoverEntrance(page: Page, label: RegExp) {
  await page.getByRole('radio', { name: label }).click();
  await page.getByRole('button', { name: /ابدأ بهذا المدخل/ }).click();
}

async function directRecommendation(page: Page, problem = 'أريد تنظيم الحجز والمواعيد للعملاء') {
  await openStart(page);
  await chooseDiscoverEntrance(page, /ساعدني على اكتشاف ما أحتاج/);
  await page.getByLabel('ما الذي تريد تغييره؟').fill(problem);
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء وفريق الخدمة');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('رحلة حجز أوضح بخطوات أقل');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما السياق التشغيلي الذي يجب أن نعرفه؟').fill('خدمة بمواعيد يديرها فريق داخلي');
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
}

async function enterBookingBuild(page: Page) {
  await openStart(page, '?prefill=booking');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
}

async function reachFirstBookingDecision(page: Page) {
  await enterBookingBuild(page);
  await expect(page.locator('[data-testid="journey-information"]')).toBeVisible();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await expect(page.getByRole('heading', { name: 'هل تريد تحصيل مبلغ عند الحجز؟' })).toBeVisible();
}

async function adoptFirstExperience(page: Page, collapseAfter = false) {
  const support = page.locator('.sfp-build-support');
  const wasOpen = await support.evaluate((element: HTMLDetailsElement) => element.open);
  if (!wasOpen) await support.locator('summary').click();
  await page.locator('.sfp-experience [role="radio"]').first().click();
  if (collapseAfter && !wasOpen) await support.locator('summary').click();
}

async function finishBuild(page: Page, adoptExperience = true) {
  if (adoptExperience) {
    await adoptFirstExperience(page, true);
  }
  while ((await page.locator('.start-discovery').getAttribute('data-stage')) === 'build') {
    const decision = page.locator('.sfp-decision [role="radio"]').first();
    if (await decision.count()) await decision.click();
    await page.getByRole('button', { name: /تابع في الرحلة|احفظ التكوين وتابع/ }).click();
  }
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'review');
}

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 1);
}

test.beforeAll(async () => { await mkdir(evidenceDirectory, { recursive: true }); });

test('v1 prefill remains compatible while SYSTEM_FINDER identity stays recommendation-only', () => {
  expect(START_DISCOVERY_PREFILL_VERSION).toBe(1);
  const userChoice = readStartDiscoveryRouteState({
    discoveryPrefill: {
      version: 1,
      recommendedFamily: 'الحجوزات والخدمات',
      solutionFamilyId: 'booking',
      decisionOrigin: 'USER_DIRECT',
      recommendationResolution: 'decisive',
      selectedCapabilities: ['قدرة قديمة مختارة'],
    },
  });
  expect(createStartDiscoveryDraft(userChoice).solutionFamilyId).toBe('booking');

  const finderRecommendation = createStartDiscoveryDraft({
    version: 1,
    recommendedFamily: 'الحجوزات والخدمات',
    solutionFamilyId: 'booking',
    decisionOrigin: 'SYSTEM_FINDER',
    configurationPreference: 'تركيز على المسار الأساسي',
  });
  expect(finderRecommendation.recommendedFamily).toBe('الحجوزات والخدمات');
  expect(finderRecommendation.solutionFamilyId).toBe('');
  expect(finderRecommendation.recommendedConfigurationPreference).toBe('تركيز على المسار الأساسي');
  expect(finderRecommendation.configurationPreference).toBe('');

  const presentEmpty = readStartDiscoveryRouteState({
    discoveryPrefill: {
      version: 1,
      selectedCapabilities: ['يجب ألا تعود'],
      optionalCapabilities: ['يجب ألا تعود أيضًا'],
      capabilitySelections: [],
    },
  });
  expect(presentEmpty?.capabilitySelections).toEqual([]);
  expect(createStartDiscoveryDraft(presentEmpty).selectedCapabilities).toEqual([]);
});

test('the registry binds all 36 governed START WebPs including the four final contextual assets', () => {
  const assets = Object.values(familyVisualAssets);
  const bound = assets.filter((asset) => asset.status === 'APPROVED_BOUND');
  expect(bound).toHaveLength(36);
  expect(bound.every((asset) => asset.runtimeUrl && asset.canonicalPath?.endsWith('.webp'))).toBe(true);
  for (const assetId of ['FAM-05-CTX-01', 'FAM-05-CTX-02', 'FAM-06-CTX-01', 'FAM-06-CTX-02']) {
    expect(familyVisualAssets[assetId]).toMatchObject({ status: 'APPROVED_BOUND' });
    expect(familyVisualAssets[assetId].runtimeUrl).toBeTruthy();
  }
});

test('direct entry exposes exactly three major stages and three keyboard-complete entrances', async ({ page }) => {
  await openStart(page);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-major-stage-count', '3');
  await expect(page.locator('.sfp-stage-rail li')).toHaveCount(3);
  const entries = page.locator('.sfp-entry-intents [role="radio"]');
  await expect(entries).toHaveCount(3);
  await expect(entries.nth(0)).toHaveAttribute('tabindex', '0');
  await expect(entries.nth(1)).toHaveAttribute('tabindex', '-1');
  await entries.nth(0).focus();
  await page.keyboard.press('End');
  await expect(entries.nth(2)).toBeFocused();
  await expect(entries.nth(2)).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Home');
  await expect(entries.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(entries.nth(1)).toBeFocused();
  await expect(entries.nth(1)).toHaveAttribute('aria-checked', 'true');
});

test('the three entrances provide distinct useful routes inside the same Discover stage', async ({ page }) => {
  await openStart(page);
  await chooseDiscoverEntrance(page, /ساعدني على اكتشاف ما أحتاج/);
  await expect(page.locator('[data-testid="discover-need-flow"]')).toBeVisible();
  await expect(page.getByLabel('ما الذي تريد تغييره؟')).toBeVisible();

  await openStart(page);
  await chooseDiscoverEntrance(page, /أعرف تقريبًا نوع الحل/);
  await expect(page.locator('[data-testid="direction-entry-browser"]')).toBeVisible();
  await page.locator('.sfp-family-focus-tabs').getByRole('button', { name: /الحجوزات والخدمات/ }).click();
  await page.getByRole('button', { name: /اعتمد الحجوزات والخدمات كنقطة بداية/ }).click();
  await expect(page.locator('[data-testid="direction-entry-confirmation"]')).toContainText('اختيارك المبكر: الحجوزات والخدمات');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-family', 'booking');

  await openStart(page);
  await chooseDiscoverEntrance(page, /أريد أن أبدأ من مثال/);
  const exampleBrowser = page.locator('[data-testid="example-entry-browser"]');
  await expect(exampleBrowser.locator('img[data-asset-status="approved-bound"]')).toHaveCount(4);
  await expect(exampleBrowser.locator('[data-asset-id$="DIR-01"]')).toBeVisible();
});

test('Discover explains what was understood and keeps recommendation separate from explicit selection', async ({ page }) => {
  await directRecommendation(page);
  await expect(page.locator('[data-testid="understood-need"]')).toContainText('فهمنا أنك تريد');
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('لماذا يناسبك؟');
  await expect(page.locator('[data-testid="system-recommendation"] img[data-asset-id="FAM-03-MSC-01"]')).toHaveAttribute('data-asset-status', 'approved-bound');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-recommended-family', 'الحجوزات والخدمات');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-family', '');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-decision-origin', 'SYSTEM_FINDER');

  await page.getByText('قارن أو اختر اتجاهًا آخر').click();
  await page.getByRole('button', { name: /العقارات والأصول/ }).click();
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('العقارات والأصول');
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-recommended-family', 'الحجوزات والخدمات');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-family', 'assets');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-decision-origin', 'USER_ALTERNATIVE');
});

test('weak input does not silently default to business and instead asks a bounded discriminator', async ({ page }) => {
  await openStart(page);
  await chooseDiscoverEntrance(page, /ساعدني على اكتشاف ما أحتاج/);
  await page.getByLabel('ما الذي تريد تغييره؟').fill('أريد تحسين الوضع الحالي');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('أشخاص مختلفون');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('نتيجة أوضح');
  await page.getByRole('button', { name: /^تابع/ }).click();
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
  await expect(page.locator('[data-testid="system-recommendation"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="bounded-candidate-choice"] [role="radio"]')).toHaveCount(3);
  await expect(page.locator('#root')).toHaveAttribute('data-draft-recommended-family', '');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-family', '');
});

test('valid Solutions v1 recommendation context is visible but is not reinterpreted as adoption', async ({ page }) => {
  await openStart(page, '?prefill=booking');
  await expect(page.locator('[data-testid="carried-context"]')).toContainText('جعل الحجز أوضح للعميل والفريق');
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-family', '');
});

test('Build journey is state-driven, keeps Booking five moments, and maps three real decisions', async ({ page }) => {
  await reachFirstBookingDecision(page);
  const journey = page.locator('.sfp-journey > button');
  await expect(journey).toHaveCount(5);
  for (const label of ['قبل الحجز', 'الحجز', 'قبل الموعد', 'تقديم الخدمة', 'بعد الخدمة']) {
    await expect(page.locator('.sfp-journey')).toContainText(label);
  }
  await expect(page.locator('.sfp-decision')).toHaveAttribute('data-moment-id', 'booking-moment-2');
  await expect(page.locator('.sfp-decision h2')).toHaveCount(1);
  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  await expect(page.locator('[data-testid="decision-consequence"]')).toContainText('في المشروع');
  await expect(page.getByText(/12,000–25,000/)).toBeVisible();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await expect(page.locator('.sfp-decision')).toHaveAttribute('data-moment-id', 'booking-moment-3');
  await expect(page.getByRole('heading', { name: /إشعارات الحالة/ })).toBeVisible();
});

test('Build and experience radio groups implement roving tabindex and arrow/Home/End activation', async ({ page }) => {
  await reachFirstBookingDecision(page);
  const answers = page.locator('.sfp-decision [role="radio"]');
  await expect(answers.nth(0)).toHaveAttribute('tabindex', '0');
  await answers.nth(0).focus();
  await page.keyboard.press('ArrowDown');
  await expect(answers.nth(1)).toBeFocused();
  await expect(answers.nth(1)).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('End');
  await expect(answers.nth(2)).toBeFocused();
  await expect(answers.nth(2)).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Home');
  await expect(answers.nth(0)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(answers.nth(0)).toHaveAttribute('aria-checked', 'true');

  const experiences = page.locator('.sfp-experience [role="radio"]');
  await expect(experiences).toHaveCount(3);
  await expect(experiences.nth(0)).toHaveAttribute('tabindex', '0');
  await expect(experiences.nth(0)).toHaveAttribute('aria-checked', 'false');
  await experiences.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(experiences.nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-experience', /ربط عدة مسارات مترابطة/);
});

test('approved contextual evidence is a bound image and the drawer restores focus without losing state', async ({ page }) => {
  await reachFirstBookingDecision(page);
  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  const trigger = page.getByRole('button', { name: /شاهد مثالًا مرتبطًا/ });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('img[data-asset-id="FAM-03-CTX-01"]')).toHaveAttribute('data-asset-status', 'approved-bound');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('radio', { name: /نعم، دفع أو عربون/ })).toHaveAttribute('aria-checked', 'true');
});

test('FAM-05 contextual evidence renders the final approved bound image', async ({ page }) => {
  await openStart(page, '?prefill=portals');
  await page.getByRole('button', { name: /تابع مع اختيارك/ }).click();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await page.getByRole('button', { name: /شاهد مثالًا مرتبطًا/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('img[data-asset-id="FAM-05-CTX-01"]')).toHaveAttribute('data-asset-status', 'approved-bound');
  await expect(dialog).not.toContainText('لم يُعتمد بعد');
});

test('mobile Build keeps one compact Project Pulse and the primary CTA before supporting exploration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await reachFirstBookingDecision(page);
  await page.locator('.sfp-decision [role="radio"]').first().click();

  const support = page.locator('.sfp-build-support');
  await expect(page.locator('[data-testid="project-pulse"]')).toHaveCount(1);
  await expect(support.locator('summary')).toBeVisible();
  expect(await support.evaluate((element: HTMLDetailsElement) => element.open)).toBe(false);
  await expectNoHorizontalOverflow(page);

  const order = await page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      if (!rect) throw new Error(`Missing mobile Build selector: ${selector}`);
      return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
    };
    return {
      consequence: box('[data-testid="decision-consequence"]'),
      pulse: box('[data-testid="project-pulse"]'),
      action: box('.sfp-build-actions'),
      support: box('.sfp-build-support'),
    };
  });
  expect(order.pulse.top).toBeGreaterThanOrEqual(order.consequence.bottom - 1);
  expect(order.action.top).toBeGreaterThanOrEqual(order.pulse.bottom - 1);
  expect(order.support.top).toBeGreaterThanOrEqual(order.action.bottom - 1);

  await support.locator('summary').click();
  await expect(page.locator('.sfp-experience [role="radio"]')).toHaveCount(3);
  await expect(page.locator('.sfp-experience [role="radio"]').first()).toHaveAttribute('tabindex', '0');
});

test('Review preserves recommendation, customer adoption, experience truth, and final local handoff', async ({ page }) => {
  await directRecommendation(page);
  await page.getByText('قارن أو اختر اتجاهًا آخر').click();
  await page.getByRole('button', { name: /العقارات والأصول/ }).click();
  await page.getByRole('button', { name: /تابع مع اختيارك/ }).click();
  await finishBuild(page, false);
  const summary = page.locator('[data-testid="project-summary"]');
  await expect(summary).toContainText('اتجاه اقترحته GS');
  await expect(summary).toContainText('الحجوزات والخدمات');
  await expect(summary).toContainText('الحل الذي اعتمدته');
  await expect(summary).toContainText('العقارات والأصول');
  await expect(summary.locator('[data-experience-state="recommended-only"]')).toContainText('مقترح للمراجعة');
  await expect(page.locator('#root')).toHaveAttribute('data-draft-selected-experience', '');
  await page.getByRole('button', { name: 'ابدأ المشروع بهذا المخطط' }).click();
  await expect(page.locator('#root')).toHaveAttribute('data-completed-family', 'assets');
  await expect(page.getByRole('status')).toContainText('تم تجهيز المخطط محليًا');
});

test('session restoration retains separate recommendation, selection, decisions, and experience adoption', async ({ page }) => {
  await directRecommendation(page);
  await page.getByText('قارن أو اختر اتجاهًا آخر').click();
  await page.getByRole('button', { name: /العقارات والأصول/ }).click();
  await page.getByRole('button', { name: /تابع مع اختيارك/ }).click();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await page.locator('.sfp-decision [role="radio"]').first().click();
  await page.locator('.sfp-experience [role="radio"]').nth(1).click();
  await page.reload();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-recommended-family', 'booking');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-selected-family', 'assets');
  await expect(page.locator('.sfp-decision [role="radio"]').first()).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.sfp-experience [role="radio"]').nth(1)).toHaveAttribute('aria-checked', 'true');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`START has no horizontal overflow and keeps the primary action reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : width === 768 ? 1024 : 900 });
    await directRecommendation(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('button', { name: /اختر هذا الاتجاه/ })).toBeVisible();
  });
}

for (const [width, height] of [[1440, 900], [1024, 900], [768, 1024], [430, 932], [390, 844]] as const) {
  test(`captures final START Discover Build Review evidence at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await directRecommendation(page);
    await page.screenshot({ path: resolve(evidenceDirectory, `discover-${width}.png`), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
    await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
    await page.locator('.sfp-decision [role="radio"]').first().click();
    await adoptFirstExperience(page, true);
    await page.screenshot({ path: resolve(evidenceDirectory, `build-${width}.png`), fullPage: true, animations: 'disabled' });
    await finishBuild(page);
    await page.screenshot({ path: resolve(evidenceDirectory, `review-${width}.png`), fullPage: true, animations: 'disabled' });
  });
}

test('captures the required truth and contextual evidence states', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await directRecommendation(page);
  await page.getByText('قارن أو اختر اتجاهًا آخر').click();
  await page.getByRole('button', { name: /العقارات والأصول/ }).click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'recommendation-vs-user-selection.png'), fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: /تابع مع اختيارك/ }).click();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await page.locator('.sfp-decision [role="radio"]').first().click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'alternate-family-material-consequence.png'), fullPage: true, animations: 'disabled' });

  await openStart(page, '?prefill=booking');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await page.getByRole('button', { name: /شاهد مثالًا مرتبطًا/ }).click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'approved-context-example.png'), fullPage: true, animations: 'disabled' });

  await openStart(page, '?prefill=portals');
  await page.getByRole('button', { name: /تابع مع اختيارك/ }).click();
  await page.getByRole('button', { name: /تابع في الرحلة/ }).click();
  await page.getByRole('button', { name: /شاهد مثالًا مرتبطًا/ }).click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'fam-05-unresolved-context.png'), fullPage: true, animations: 'disabled' });

  await openStart(page, '?prefill=booking');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'experience-recommendation-only.png'), fullPage: true, animations: 'disabled' });
  await page.locator('.sfp-experience [role="radio"]').nth(1).click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'experience-recommendation-and-adoption.png'), fullPage: true, animations: 'disabled' });
});
