import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { createStartDiscoveryDraft } from '../../../src/features/start-discovery/discoveryModel';
import { readStartDiscoveryRouteState } from '../../../src/routes/startDiscoveryRouteState';
import { START_DISCOVERY_PREFILL_VERSION } from '../../../src/types/start-discovery';

const previewPath = './';
const evidenceDirectory = resolve(
  process.env.START_DISCOVERY_EVIDENCE_DIR ?? 'test-results/visual-evidence/gs-final-public-w01-start',
);

async function openStart(page: Page, query = '') {
  await page.addInitScript(() => window.sessionStorage.removeItem('gs-start-frozen-product-v1'));
  await page.goto(`${previewPath}${query}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.start-discovery')).toBeVisible();
  await expect(page.locator('#start-discovery-title')).toBeFocused();
}

async function directRecommendation(page: Page, problem = 'أريد تنظيم الحجز والمواعيد للعملاء') {
  await openStart(page);
  await page.getByRole('button', { name: /ساعدني على اكتشاف ما أحتاج/ }).click();
  await page.getByLabel('ما الذي تريد تغييره؟').fill(problem);
  await page.getByLabel('من سيستخدم هذا الحل؟').fill('العملاء وفريق الخدمة');
  await page.getByLabel('ما النتيجة التي تريد الوصول إليها؟').fill('رحلة أوضح بخطوات أقل');
  await page.getByRole('button', { name: /ابنِ اتجاهًا أوليًا/ }).click();
}

async function enterBookingBuild(page: Page) {
  await openStart(page, '?prefill=booking');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
}

async function reachReview(page: Page) {
  await enterBookingBuild(page);
  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  await page.getByRole('button', { name: /تابع إلى القرار التالي/ }).click();
  await page.getByRole('radio', { name: /نعم، أضفها/ }).click();
  await page.getByRole('button', { name: /احفظ التكوين وتابع/ }).click();
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

test('v1 prefill and N12 explicit channel presence remain preserved', () => {
  expect(START_DISCOVERY_PREFILL_VERSION).toBe(1);
  const absent = readStartDiscoveryRouteState({
    discoveryPrefill: {
      version: 1,
      solutionFamilyId: 'booking',
      decisionOrigin: 'USER_DIRECT',
      recommendationResolution: 'decisive',
      selectedCapabilities: ['قدرة قديمة مختارة'],
    },
  });
  expect(absent?.solutionFamilyId).toBe('booking');
  expect(absent?.decisionOrigin).toBe('USER_DIRECT');
  expect(absent?.recommendationResolution).toBe('decisive');
  expect(Object.prototype.hasOwnProperty.call(absent ?? {}, 'capabilitySelections')).toBe(false);
  expect(createStartDiscoveryDraft(absent).selectedCapabilities).toEqual(['قدرة قديمة مختارة']);

  const presentEmpty = readStartDiscoveryRouteState({
    discoveryPrefill: {
      version: 1,
      selectedCapabilities: ['يجب ألا تعود'],
      optionalCapabilities: ['يجب ألا تعود أيضًا'],
      capabilitySelections: [],
    },
  });
  expect(presentEmpty?.capabilitySelections).toEqual([]);
  const emptyDraft = createStartDiscoveryDraft(presentEmpty);
  expect(emptyDraft.selectedCapabilities).toEqual([]);
  expect(emptyDraft.optionalCapabilities).toEqual([]);

  const contradictory = readStartDiscoveryRouteState({
    discoveryPrefill: {
      version: 1,
      capabilitySelections: [
        { name: 'قدرة متعارضة', classification: 'RECOMMENDED', provenance: 'SYSTEM_SEEDED' },
        { name: ' قدرة متعارضة ', classification: 'CUSTOM', provenance: 'USER_SELECTED' },
      ],
    },
  });
  expect(contradictory?.capabilitySelections).toEqual([]);
  expect(createStartDiscoveryDraft(contradictory).selectedCapabilities).toEqual([]);
});

test('direct entry exposes exactly three major stages and three entrances without creating extra stages', async ({ page }) => {
  await openStart(page);
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-major-stage-count', '3');
  await expect(page.locator('.sfp-stage-rail li')).toHaveCount(3);
  await expect(page.locator('.sfp-stage-rail')).toContainText('اكتشف ما يناسبك');
  await expect(page.locator('.sfp-stage-rail')).toContainText('كوّن حلّك');
  await expect(page.locator('.sfp-stage-rail')).toContainText('راجع وابدأ');
  for (const label of ['ساعدني على اكتشاف ما أحتاج', 'أعرف تقريبًا نوع الحل', 'أريد أن أبدأ من مثال']) {
    await expect(page.getByRole('button', { name: new RegExp(label) })).toBeVisible();
  }
});

test('Discover is progressive, keeps recommendation separate from selection, and exposes six canonical families', async ({ page }) => {
  await directRecommendation(page);
  await expect(page.getByLabel('ما الذي تريد تغييره؟')).toHaveCount(0);
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
  await expect(page.getByText('تقدير أولي للميزانية')).toBeVisible();
  await expect(page.getByText(/10,000–25,000/)).toBeVisible();
  await expect(page.getByText(/ليس عرض سعر نهائيًا/)).toBeVisible();
  await expect(page.locator('[data-testid="project-pulse"]')).toHaveCount(1);

  await page.getByText('قارن أو اختر اتجاهًا آخر').click();
  for (const title of [
    'مواقع الأعمال والخدمات',
    'التجارة الرقمية وتجارب العلامات',
    'الحجوزات والخدمات',
    'العقارات والأصول',
    'الأنظمة التشغيلية والبوابات',
    'التعليم والمعرفة والمحتوى',
  ]) {
    await expect(page.getByRole('button', { name: new RegExp(title) })).toBeVisible();
  }
  await page.getByRole('button', { name: /العقارات والأصول/ }).click();
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('العقارات والأصول');
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
});

test('valid Solutions v1 context is visibly carried without asking known truth again', async ({ page }) => {
  await openStart(page, '?prefill=booking');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-prefilled', 'true');
  await expect(page.locator('[data-testid="carried-context"]')).toContainText('جعل الحجز أوضح للعميل والفريق');
  await expect(page.locator('[data-testid="carried-context"]')).toContainText('خدمة تعتمد على المواعيد');
  await expect(page.getByLabel('ما الذي تريد تغييره؟')).toHaveCount(0);
  await expect(page.locator('[data-testid="system-recommendation"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="user-selection"]')).toContainText('لم تعتمد اتجاهًا بعد.');
});

test('Build presents one dominant decision, family journey, semantic selection and material consequence', async ({ page }) => {
  await enterBookingBuild(page);
  await expect(page.locator('.sfp-journey')).toContainText('قبل الحجز');
  await expect(page.locator('.sfp-journey')).toContainText('الحجز');
  await expect(page.locator('.sfp-journey')).toContainText('قبل الموعد');
  await expect(page.locator('.sfp-journey')).toContainText('تقديم الخدمة');
  await expect(page.locator('.sfp-journey')).toContainText('بعد الخدمة');
  await expect(page.getByRole('heading', { name: 'هل تريد تحصيل مبلغ عند الحجز؟' })).toBeVisible();
  await expect(page.locator('.sfp-decision h2')).toHaveCount(1);

  const answer = page.getByRole('radio', { name: /نعم، دفع أو عربون/ });
  await answer.focus();
  await page.keyboard.press('Space');
  await expect(answer).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('heading', { name: 'ماذا يتغير؟' })).toBeVisible();
  await expect(page.locator('[data-testid="decision-consequence"]')).toContainText('في المشروع');
  await expect(page.getByText(/12,000–25,000/)).toBeVisible();
  await expect(page.locator('[data-testid="project-pulse"]')).toHaveCount(1);
});

test('a prior Build decision can be revised without creating a new stage', async ({ page }) => {
  await enterBookingBuild(page);
  const yes = page.getByRole('radio', { name: /نعم، دفع أو عربون/ });
  const no = page.getByRole('radio', { name: /لا، بدون دفع الآن/ });
  await yes.click();
  await expect(yes).toHaveAttribute('aria-checked', 'true');
  await no.click();
  await expect(no).toHaveAttribute('aria-checked', 'true');
  await expect(yes).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-major-stage-count', '3');
});

test('contextual example traps focus, preserves decision state, and restores focus on close', async ({ page }) => {
  await enterBookingBuild(page);
  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  const trigger = page.getByRole('button', { name: /شاهد مثالًا/ });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-asset-id="FAM-03-CTX-01"]')).toHaveAttribute('data-asset-status', 'approved-unbound');
  await expect(dialog.locator('img')).toHaveCount(0);
  await expect(dialog).toContainText('الأصل البصري المعتمد بانتظار الربط التشغيلي');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('radio', { name: /نعم، دفع أو عربون/ })).toHaveAttribute('aria-checked', 'true');
});

test('pending FAM-05 contextual slot stays semantic and does not fabricate product art', async ({ page }) => {
  await openStart(page, '?prefill=portals');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  const firstAnswer = page.locator('.sfp-decision [role="radio"]').first();
  await firstAnswer.click();
  await page.getByRole('button', { name: /شاهد مثالًا/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[data-asset-id="FAM-05-CTX-01"]')).toHaveAttribute('data-asset-status', 'unresolved');
  await expect(dialog.locator('img')).toHaveCount(0);
  await expect(dialog).toContainText('المثال البصري لهذا السياق لم يُعتمد بعد');
});

test('Review carries choices into a customer-readable blueprint and exact start actions', async ({ page }) => {
  await reachReview(page);
  await expect(page.locator('[data-testid="project-blueprint"]')).toContainText('الحجوزات والخدمات');
  await expect(page.locator('[data-testid="project-blueprint"]')).toContainText('ربط التقويم أو الدفع');
  await expect(page.locator('[data-testid="project-summary"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="project-pulse"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'يمكنك المتابعة' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ابدأ المشروع بهذا المخطط' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'عدّل مشروعك' })).toBeVisible();
  await expect(page.getByText(/لن تحتاج إلى إدخالها من جديد/)).toBeVisible();
  await expect(page.locator('.sfp-review-needs li')).toHaveCount(2);

  await page.getByRole('button', { name: 'عدّل مشروعك' }).click();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await page.getByRole('button', { name: /احفظ التكوين وتابع/ }).click();
  await expect(page.locator('[data-testid="project-blueprint"]')).toContainText('ربط التقويم أو الدفع');
  await page.getByRole('button', { name: 'ابدأ المشروع بهذا المخطط' }).click();
  await expect(page.locator('#root')).toHaveAttribute('data-completed-family', 'booking');
  await expect(page.getByRole('status')).toContainText('تم تجهيز المخطط محليًا');
});

test('session state survives a route-equivalent reload without silently losing the project', async ({ page }) => {
  await enterBookingBuild(page);
  await page.getByRole('radio', { name: /نعم، دفع أو عربون/ }).click();
  await page.reload();
  await expect(page.locator('.start-discovery')).toHaveAttribute('data-stage', 'build');
  await expect(page.getByRole('radio', { name: /نعم، دفع أو عربون/ })).toHaveAttribute('aria-checked', 'true');
});

for (const width of [1440, 1024, 768, 430, 390]) {
  test(`START has no horizontal overflow and keeps the primary action reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : width === 768 ? 1024 : 900 });
    await directRecommendation(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('button', { name: /اختر هذا الاتجاه/ })).toBeVisible();
  });
}

for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]] as const) {
  test(`captures frozen START Discover Build Review evidence at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await directRecommendation(page);
    await page.screenshot({ path: resolve(evidenceDirectory, `discover-${width}.png`), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
    await page.locator('.sfp-decision [role="radio"]').first().click();
    await page.screenshot({ path: resolve(evidenceDirectory, `build-${width}.png`), fullPage: true, animations: 'disabled' });
    while ((await page.locator('.start-discovery').getAttribute('data-stage')) === 'build') {
      const button = page.getByRole('button', { name: /تابع إلى القرار التالي|احفظ التكوين وتابع/ });
      if (await button.isDisabled()) await page.locator('.sfp-decision [role="radio"]').first().click();
      await button.click();
    }
    await page.screenshot({ path: resolve(evidenceDirectory, `review-${width}.png`), fullPage: true, animations: 'disabled' });
  });
}

test('captures unresolved FAM-05 contextual asset behavior', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStart(page, '?prefill=portals');
  await page.getByRole('button', { name: /اختر هذا الاتجاه/ }).click();
  await page.locator('.sfp-decision [role="radio"]').first().click();
  await page.getByRole('button', { name: /شاهد مثالًا/ }).click();
  await page.screenshot({ path: resolve(evidenceDirectory, 'fam-05-unresolved-context.png'), fullPage: true, animations: 'disabled' });
});
