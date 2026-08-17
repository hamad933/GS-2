#!/usr/bin/env python3
from pathlib import Path
import subprocess

FROZEN = 'e8d85dfb9e0855e76711b5c4e7bbc8f36827d9cc'
EXPECTED_BLOBS = {
    'src/data/visual/familyVisualAssets.ts': 'd5c640580e3c97a550bbd0242f02929507853c75',
    'src/features/solutions/SolutionsExploration.tsx': 'a1a4dfa0a4e5bdf650577e9a2e19dbbff7f7eee5',
    'tests/visual/solutions/solutions-workspace.visual.spec.ts': '2f4c51ba4feca65e75007a613826fe0b1989aec4',
}


def git_blob(path: str) -> str:
    return subprocess.check_output(['git', 'rev-parse', f'{FROZEN}:{path}'], text=True).strip()


def require_exact_frozen_files() -> None:
    for path, expected in EXPECTED_BLOBS.items():
        actual = git_blob(path)
        if actual != expected:
            raise SystemExit(f'FROZEN_SOURCE_BLOB_MISMATCH {path} expected={expected} actual={actual}')
        worktree = subprocess.check_output(['git', 'hash-object', path], text=True).strip()
        if worktree != expected:
            raise SystemExit(f'WORKTREE_NOT_EXACT_FROZEN {path} expected={expected} actual={worktree}')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'PATCH_ANCHOR_MISMATCH {label} count={count}')
    return text.replace(old, new, 1)


def patch_assets() -> None:
    p = Path('src/data/visual/familyVisualAssets.ts')
    t = p.read_text(encoding='utf-8')
    t = replace_once(
        t,
        "export type FamilyAssetRole = 'MASTER' | 'DIRECTION' | 'CONTEXTUAL_CUSTOMER' | 'CONTEXTUAL_OPERATIONS';",
        "export type FamilyAssetRole = 'MASTER' | 'EMBLEM' | 'COMPARE' | 'DIRECTION' | 'CONTEXTUAL_CUSTOMER' | 'CONTEXTUAL_OPERATIONS';",
        'asset-role-type',
    )
    runtime_add = """  'FAM-01-EMB-01': new URL('../../assets/gs-public-v1/families/FAM-01/EMBLEM/FAM-01-EMB-01.webp', import.meta.url).href,
  'FAM-02-EMB-01': new URL('../../assets/gs-public-v1/families/FAM-02/EMBLEM/FAM-02-EMB-01.webp', import.meta.url).href,
  'FAM-03-EMB-01': new URL('../../assets/gs-public-v1/families/FAM-03/EMBLEM/FAM-03-EMB-01.webp', import.meta.url).href,
  'FAM-04-EMB-01': new URL('../../assets/gs-public-v1/families/FAM-04/EMBLEM/FAM-04-EMB-01.webp', import.meta.url).href,
  'FAM-05-EMB-01': new URL('../../assets/gs-public-v1/families/FAM-05/EMBLEM/FAM-05-EMB-01.webp', import.meta.url).href,
  'FAM-06-EMB-01': new URL('../../assets/gs-public-v1/families/FAM-06/EMBLEM/FAM-06-EMB-01.webp', import.meta.url).href,
  'FAM-03-CMP-01': new URL('../../assets/gs-public-v1/families/FAM-03/COMPARE/FAM-03-CMP-01.webp', import.meta.url).href,
  'FAM-05-CMP-01': new URL('../../assets/gs-public-v1/families/FAM-05/COMPARE/FAM-05-CMP-01.webp', import.meta.url).href,
"""
    t = replace_once(t, "};\n\nconst approved =", runtime_add + "};\n\nconst approved =", 'runtime-assets-end')

    asset_add = """  'FAM-01-EMB-01': approved('FAM-01-EMB-01', 'FAM-01', 'EMBLEM', 'src/assets/gs-public-v1/families/FAM-01/EMBLEM/FAM-01-EMB-01.webp'),
  'FAM-02-EMB-01': approved('FAM-02-EMB-01', 'FAM-02', 'EMBLEM', 'src/assets/gs-public-v1/families/FAM-02/EMBLEM/FAM-02-EMB-01.webp'),
  'FAM-03-EMB-01': approved('FAM-03-EMB-01', 'FAM-03', 'EMBLEM', 'src/assets/gs-public-v1/families/FAM-03/EMBLEM/FAM-03-EMB-01.webp'),
  'FAM-04-EMB-01': approved('FAM-04-EMB-01', 'FAM-04', 'EMBLEM', 'src/assets/gs-public-v1/families/FAM-04/EMBLEM/FAM-04-EMB-01.webp'),
  'FAM-05-EMB-01': approved('FAM-05-EMB-01', 'FAM-05', 'EMBLEM', 'src/assets/gs-public-v1/families/FAM-05/EMBLEM/FAM-05-EMB-01.webp'),
  'FAM-06-EMB-01': approved('FAM-06-EMB-01', 'FAM-06', 'EMBLEM', 'src/assets/gs-public-v1/families/FAM-06/EMBLEM/FAM-06-EMB-01.webp'),
  'FAM-03-CMP-01': approved('FAM-03-CMP-01', 'FAM-03', 'COMPARE', 'src/assets/gs-public-v1/families/FAM-03/COMPARE/FAM-03-CMP-01.webp'),
  'FAM-05-CMP-01': approved('FAM-05-CMP-01', 'FAM-05', 'COMPARE', 'src/assets/gs-public-v1/families/FAM-05/COMPARE/FAM-05-CMP-01.webp'),

"""
    t = replace_once(t, "\n};\n\nconst familyNumbers", "\n" + asset_add + "};\n\nconst familyNumbers", 'asset-map-end')
    t = replace_once(
        t,
        "role: 'MASTER' | 'DIR-01' | 'DIR-02' | 'DIR-03' | 'CTX-01' | 'CTX-02',",
        "role: 'MASTER' | 'EMBLEM' | 'COMPARE' | 'DIR-01' | 'DIR-02' | 'DIR-03' | 'CTX-01' | 'CTX-02',",
        'get-id-role-type',
    )
    t = replace_once(
        t,
        "  if (role === 'MASTER') return `${family}-MSC-01`;\n  return `${family}-${role}`;",
        "  if (role === 'MASTER') return `${family}-MSC-01`;\n  if (role === 'EMBLEM') return `${family}-EMB-01`;\n  if (role === 'COMPARE') return `${family}-CMP-01`;\n  return `${family}-${role}`;",
        'get-id-role-map',
    )
    p.write_text(t, encoding='utf-8')


def patch_component() -> None:
    p = Path('src/features/solutions/SolutionsExploration.tsx')
    t = p.read_text(encoding='utf-8')
    t = replace_once(
        t,
        "role: 'MASTER' | 'DIR-01' | 'DIR-02' | 'DIR-03' | 'CTX-01' | 'CTX-02';",
        "role: 'MASTER' | 'EMBLEM' | 'COMPARE' | 'DIR-01' | 'DIR-02' | 'DIR-03' | 'CTX-01' | 'CTX-02';",
        'component-asset-role-type',
    )
    t = replace_once(t, 'role="MASTER" className="solutions-family-tab__image"', 'role="EMBLEM" className="solutions-family-tab__image"', 'recognition-emblem')
    t = replace_once(
        t,
        '<div className="solutions-compare__visuals" aria-hidden="true"><Asset familyId="booking" role="MASTER" /><div><span>رحلة العميل إلى الخدمة والموعد</span><i /><span>عمل الفريق والطلبات والسجلات</span></div><Asset familyId="portals" role="MASTER" /></div>',
        '<div className="solutions-compare__visuals" aria-hidden="true"><Asset familyId="booking" role="COMPARE" /><div><span>رحلة العميل إلى الخدمة والموعد</span><i /><span>عمل الفريق والطلبات والسجلات</span></div><Asset familyId="portals" role="COMPARE" /></div>',
        'compare-assets',
    )
    p.write_text(t, encoding='utf-8')


def patch_test() -> None:
    p = Path('tests/visual/solutions/solutions-workspace.visual.spec.ts')
    t = p.read_text(encoding='utf-8')
    t = replace_once(
        t,
        "  await openSolutions(page);\n  await expect(page.getByRole('tab')).toHaveCount(6);\n  await expect(page.locator('.solutions-family-tab [data-asset-id$=\"-MSC-01\"]')).toHaveCount(6);",
        "  await page.setViewportSize({ width: 1440, height: 1000 });\n  await openSolutions(page);\n  await expect(page.getByRole('tab')).toHaveCount(6);\n  const recognition = [\n    ['business', 'FAM-01-EMB-01'],\n    ['commerce', 'FAM-02-EMB-01'],\n    ['booking', 'FAM-03-EMB-01'],\n    ['assets', 'FAM-04-EMB-01'],\n    ['portals', 'FAM-05-EMB-01'],\n    ['knowledge', 'FAM-06-EMB-01'],\n  ] as const;\n  for (const [familyId, assetId] of recognition) {\n    await expect(page.locator(`[data-family-id=\"${familyId}\"] [data-asset-id=\"${assetId}\"]`)).toBeVisible();\n  }\n  await expect(page.locator('.solutions-family-tab [data-asset-id$=\"-EMB-01\"]')).toHaveCount(6);",
        'recognition-test',
    )
    t = replace_once(
        t,
        "  await expect(page.getByRole('tab', { name: /الحجوزات والخدمات/ })).toHaveAttribute('aria-selected', 'true');\n});",
        "  await expect(page.getByRole('tab', { name: /الحجوزات والخدمات/ })).toHaveAttribute('aria-selected', 'true');\n  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-recognition-1440.png'), fullPage: true });\n});",
        'recognition-screenshot',
    )
    t = replace_once(
        t,
        "  await expect(panel.locator('[data-asset-id^=\"FAM-03-DIR-\"]')).toHaveCount(3);",
        "  await expect(panel.locator('[data-asset-id^=\"FAM-03-DIR-\"]')).toHaveCount(3);\n  await expect(panel.locator('[data-asset-id=\"FAM-03-CTX-01\"]')).toHaveCount(1);\n  await expect(panel.locator('[data-asset-id=\"FAM-03-CTX-02\"]')).toHaveCount(1);",
        'dir-ctx-proof',
    )
    t = replace_once(
        t,
        "  await expect(page.getByText(/Capability Builder|Project Pulse|CORE|RECOMMENDED|OPTIONAL/)).toHaveCount(0);\n});",
        "  await expect(page.getByText(/Capability Builder|Project Pulse|CORE|RECOMMENDED|OPTIONAL/)).toHaveCount(0);\n  for (const detail of await panel.locator('.solutions-proof details').all()) await detail.locator('summary').click();\n  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-booking-product-directions-context-1440.png'), fullPage: true });\n});",
        'product-proof-screenshot',
    )
    t = replace_once(
        t,
        "    await expect(reference).not.toContainText('NOT_AVAILABLE');\n  }",
        "    await expect(reference).not.toContainText('NOT_AVAILABLE');\n    if (familyId === 'business') await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-reference-unavailable-1440.png'), fullPage: true });\n    if (familyId === 'commerce') {\n      await expect(page.getByRole('tabpanel').locator('[data-asset-id=\"FAM-02-MSC-01\"]')).toBeVisible();\n      await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-reference-available-non-booking-commerce-1440.png'), fullPage: true });\n    }\n  }",
        'reference-evidence',
    )
    t = replace_once(
        t,
        "  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-family', 'assets');\n});",
        "  await expect(page.locator(EXPLORATION)).toHaveAttribute('data-family', 'assets');\n  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-keyboard-focus.png'), fullPage: true });\n});",
        'keyboard-screenshot',
    )
    t = replace_once(
        t,
        "  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-origin', 'USER_DIRECT');\n  await page.reload();",
        "  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-origin', 'USER_DIRECT');\n  await page.locator('#fixture-transition').evaluate((node) => { node.hidden = false; node.textContent = 'START handoff · booking · USER_DIRECT'; });\n  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-start-direct-handoff.png'), fullPage: true });\n  await page.reload();",
        'start-screenshot',
    )
    t = replace_once(
        t,
        "  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-family', 'none');\n});",
        "  await expect(page.locator('#fixture-transition')).toHaveAttribute('data-family', 'none');\n  await page.locator('#fixture-transition').evaluate((node) => { node.hidden = false; node.textContent = 'Escape Hatch · START Discover · no fabricated family'; });\n  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'w02-escape-hatch-handoff.png'), fullPage: true });\n});",
        'escape-screenshot',
    )
    t = replace_once(
        t,
        "await expect(page.locator('.solutions-compare__visuals [data-asset-id=\"FAM-03-MSC-01\"]')).toBeVisible();",
        "await expect(page.locator('.solutions-compare__visuals [data-asset-id=\"FAM-03-CMP-01\"]')).toBeVisible();",
        'compare-booking-assert',
    )
    t = replace_once(
        t,
        "await expect(page.locator('.solutions-compare__visuals [data-asset-id=\"FAM-05-MSC-01\"]')).toBeVisible();",
        "await expect(page.locator('.solutions-compare__visuals [data-asset-id=\"FAM-05-CMP-01\"]')).toBeVisible();",
        'compare-ops-assert',
    )
    p.write_text(t, encoding='utf-8')


require_exact_frozen_files()
patch_assets()
patch_component()
patch_test()

component = Path('src/features/solutions/SolutionsExploration.tsx').read_text(encoding='utf-8')
if 'const reference = family.reference;' not in component:
    raise SystemExit('M02_REFERENCE_MODEL_NOT_PRESERVED')
if 'role="MASTER" alt={`مشهد منتج معتمد يوضح طبيعة ${family.title}`}' not in component:
    raise SystemExit('MSC_PRODUCT_SCENE_NOT_PRESERVED')
if 'role="EMBLEM" className="solutions-family-tab__image"' not in component:
    raise SystemExit('EMBLEM_RECOGNITION_NOT_BOUND')
if 'familyId="booking" role="COMPARE"' not in component or 'familyId="portals" role="COMPARE"' not in component:
    raise SystemExit('COMPARE_BINDING_NOT_BOUND')
print('M01_PATCH_APPLIED_WITH_M02_GUARD')
