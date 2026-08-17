# GS Visual Execution Entry Point

This file records stable implementation and evidence boundaries for authorized GS visual work. It does not authorize implementation by itself.

## Active W05 homepage visual authority — V2

When W05 V2 homepage visual work is explicitly in scope, the controlling homepage visual-integration references are:

- `GS_W05_VISUAL_INTEGRATION_MANIFEST_V2.md`
- `gs-home-v2/integrated-targets/` — owner-approved **Integrated Targets / Visual Composition Authority**
- `../../src/assets/gs-home-v2/` — approved **Clean Production Assets / Runtime Visual Material**
- `codex/gs-visual-integration/SKILL.md` — repository-local procedural guidance
- `codex/gs-visual-integration/references/QA_RUBRIC.md` — visual self-review rubric

The prior [`GS_HOMEPAGE_VISUAL_MASTER_V1.png`](./GS_HOMEPAGE_VISUAL_MASTER_V1.png) is **SUPERSEDED FOR W05 IMPLEMENTATION AUTHORITY**. Retain it as historical/supporting reference only; do not use it to override the V2 Integrated Targets.

Generated copy, logos, metrics, screenshots, claims, and contact details visible inside image-generated references are not product/content truth.

## Homepage structure

- `S01` — Living System Hero
- `S02` — Solutions Universe
- `S03` — Reference Projects / Proof
- `S04` — How We Build / System Anatomy
- `S05` — GS + Project Gateway

## Hero progression

The active visible stage labels are exactly:

`الاحتياج` → `الاتجاه` → `البناء` → `الإطلاق`

The Hero is one persistent system across four states. Use one clean Hero environment; do not swap four background images.

## Stable implementation boundaries

- Arabic-first RTL.
- Preserve a premium authored digital-system identity; do not default to generic SaaS/dashboard/card treatments.
- Production Hero must not autoplay.
- Do not use a conventional progress bar.
- Do not use generic previous/next slideshow controls.
- Progression must be causal and user-driven.
- The clean image and the real DOM must share one authored coordinate system; do not implement `background image + detached HTML overlay`.
- Do not fabricate metrics, clients, testimonials, performance evidence, operational claims, project screenshots, or other proof.
- `S03` must preserve replaceable real project-media insertion surfaces so authoritative RP01–RP04 screenshots can be integrated later without section re-architecture.
- `RP01`–`RP04` remain independent products.
- Do not expose internal words such as placeholder, reference, evidence, or engineered preview in public-facing copy.
- Do not add dependencies merely for animation when CSS/React state is sufficient.
- Do not recompress/regenerate V2 production derivatives during a section implementation workstream.

## Desktop-first homepage visual gate

For W05 V2 homepage reconstruction, 1440px is the primary fidelity viewport.

Implement and review each bounded homepage section against its Integrated Target at 1440 before responsive closure. 768px and 390px are independently authored responsive compositions, not proportional scale-downs.

## Current whole-public-site validation and evidence model

The current W07-era public site is larger than the W05 Hero/Homepage-only evidence scope. Repository-native whole-public-site evidence therefore uses:

- `tests/visual/public-site.integration.spec.ts` for current integrated public routes, navigation, public behavior, handoffs, and related runtime assertions;
- `tests/visual/public-site.evidence.spec.ts` for the current multi-route, multi-viewport screenshot evidence matrix and critical public-site states.

`tests/visual/hero.visual.spec.ts` remains useful for bounded Hero/Homepage-specific review. It must not be treated as the generic future whole-public-site evidence contract.

The generic Visual Evidence workflow must run the whole-public-site harnesses above and verify that screenshot evidence was actually produced. It must not encode a permanent historical screenshot-filename manifest as repository-wide policy. Screenshot filenames emitted by a current harness may evolve with an authorized future site baseline; only explicitly governed critical captures are required by name when a current workstream contract demands them.

## Exact-head evidence route contract

The Visual Evidence workflow validates the exact candidate commit, not an inferred branch tip or a stale checkout. It must:

1. check out `${{ github.event.pull_request.head.sha || github.sha }}` with full history;
2. verify `git rev-parse HEAD` equals that exact SHA;
3. for pull requests, run `git diff --check` from the event base SHA to the event head SHA;
4. run `npm ci`, lint, typecheck, build, and install Chromium before browser validation;
5. preserve visible failures: required suites do not use `continue-on-error`, and Playwright exit codes are not swallowed.

## Canonical Playwright harness map

Fixture/config-specific suites execute through their repository-native configs so each config owns its intended server, fixture, base URL, and browser contract. They must not be forced through the root public-app server on port 4173.

The canonical specialized executions are:

```sh
npx playwright test --config=tests/visual/solutions/playwright.config.ts
npx playwright test --config=tests/visual/start-discovery/playwright.config.ts
npx playwright test --config=tests/visual/public-semantics/playwright.config.ts
npx playwright test --config=tests/visual/reference-projects/playwright.config.ts
```

The root public-app Playwright config remains the contract for the root-app suites. The Visual Evidence workflow runs these explicitly with Chromium and one worker:

```sh
npx playwright test tests/visual/route-performance/route-performance.spec.ts --project=chromium --workers=1
npx playwright test tests/visual/how-we-work/how-we-work.visual.spec.ts --project=chromium --workers=1
npx playwright test tests/visual/shell.routing.spec.ts --project=chromium --workers=1
npx playwright test tests/visual/home-public-routing/home-public-routing.spec.ts --project=chromium --workers=1
npx playwright test tests/visual/public-site.integration.spec.ts --project=chromium --workers=1
npx playwright test tests/visual/public-site.evidence.spec.ts --project=chromium --workers=1
```

Do not invent a shared Playwright config merely to reduce command count. Harness ownership is part of the evidence contract.

## W08-B diff-aware specialized regression contract

For pull-request events, the workflow inspects the exact event base-to-head changed paths before deciding whether the W08-B specialized regression is required. The bounded canonical W08-B product-scope set is the accepted PR67/Home-RP product surface:

- `src/components/footer/Footer.remediation.css`
- `src/components/footer/Footer.tsx`
- `src/components/project/ProjectMedia.tsx`
- `src/components/sections/ReferenceProof.remediation.css`
- `src/components/sections/ReferenceProof.tsx`
- `src/data/homeShowcase.ts`

The specialized regression path is:

- `tests/visual/home-public-routing/gs-pages-w08-b-home-truth.spec.ts`

The deterministic rule is:

- if any bounded W08-B-owned product path appears in the pull-request base-to-head diff, the specialized regression file must exist; absence is a required-suite failure;
- if the specialized regression file exists on the exact tested head, it is executed even when the current pull-request diff contains no W08-B-owned product path;
- only when no bounded W08-B product path is in scope and the specialized file is also absent may the workflow emit an explicit out-of-scope informational skip;
- no future integration branch name is used as the criterion.

This allows standalone governance PRs to remain correctly out of scope while preventing a future integrated candidate from false-passing after accepting W08-B product changes without its required specialized regression.

The Visual Evidence job binds `VISUAL_EVIDENCE_DIR` to `visual-evidence/public-site`, so W08-B specialized captures are written under `visual-evidence/public-site/gs-pages-w08-b/`. When W08-B is in scope, artifact validation requires the non-empty `after-430-s03-reference-proof.png`, `after-390-s03-reference-proof.png`, `after-430-footer.png`, and `after-390-footer.png` files in that subdirectory. These mobile S03 and Footer captures are included in the same exact-SHA artifact as the remaining public-site evidence. The existing generic recursive PNG validation and governed R5 screenshot requirements remain unchanged.

## Final evidence route coverage and M14 dependency

The source-ready workflow is intended to be capable of executing on one exact future integrated SHA:

- lint;
- typecheck;
- build;
- Solutions canonical suite;
- Start / Discovery canonical suite;
- Public Semantics canonical suite;
- Reference Projects canonical suite;
- route-performance;
- How We Work;
- shell routing;
- Home public routing;
- W08-B specialized regression when in scope, and whenever the file exists;
- whole-site integration;
- whole-site evidence;
- the governed R5 Compare-at-limit capture at `1440x900`;
- the governed R5 Compare-at-limit capture at `390x844`.

`FINAL EVIDENCE ROUTE SOURCE_READY` is contingent on the accepted PR69 R6 correction for `GS-DR001-M14` being integrated. The current stale `tests/visual/public-site.integration.spec.ts` is not modified by GS-GOV-W08-C-R3. This governance route must not compensate for M14 by changing application or test semantics, and no PASS is claimed for final integrated execution until all required suites actually run on that exact integrated SHA.

## R5 rendered capture preservation

The whole-site evidence harness remains the owner of the two governed W08-R5 Family Compare at-limit captures. GS-GOV-W08-C-R3 does not modify `tests/visual/public-site.evidence.spec.ts` or their semantics.

The required preserved files are:

- `w08-r5-1440-solutions-compare-at-limit.png` at a `1440x900` viewport;
- `w08-r5-390-solutions-compare-at-limit.png` at a `390x844` viewport.

Artifact validation remains generic for the rest of the evidence directory: at least one PNG must exist and every discovered PNG must be non-empty. The two governed W08-R5 captures above are additionally required to exist and be non-empty. This does not create a fixed historical manifest for every screenshot.

The uploaded artifact name is SHA-bound:

`gs-public-site-reference-only-${{ github.event.pull_request.head.sha || github.sha }}`

That artifact is technical evidence bound to one exact candidate SHA. It is `REFERENCE_ONLY`; it is not release authority, merge authority, or Owner acceptance.

## Evidence and acceptance

Visual review requires direct rendered evidence when the Workstream Contract requires visual judgment; a green CI result or successful artifact upload alone is not visual acceptance.

A section may fail visual review when imagery and DOM still read as separate layers even if both are individually polished.

Repository screenshots and GitHub Actions artifacts are `REFERENCE_ONLY` by default unless a separately authorized governance action promotes them under `docs/governance/EVIDENCE_AND_HANDOFF.md`. Executors do not write them to Google Drive.

Controller technical review and Owner acceptance are distinct. `CONTROLLER VISUAL PASS` or another Controller technical pass does not equal `OWNER VISUAL ACCEPTANCE`. Where Owner acceptance is reserved by the governed control state or Workstream Contract, only explicit Owner acceptance satisfies that gate.

A GitHub Actions job that never starts because of account billing, spending-limit, runner-platform, or equivalent platform restriction is classified as `PLATFORM/BILLING BLOCKED` when that is the directly verified cause. That state is neither an implementation PASS nor an implementation FAIL. No lint, typecheck, build, browser, screenshot, or artifact conclusion may be inferred from an unstarted job.
