# GS W05 — Visual Integration Authority V2

**Contract ID:** `GS-W05-VISUAL-INTEGRATION-V2`  
**Status:** `OWNER-APPROVED — ACTIVE IMPLEMENTATION AUTHORITY`  
**Project:** `GS`  
**Repository:** `hamad933/GS-2`  
**Supersedes for W05 implementation:** `GS_HOMEPAGE_VISUAL_MASTER_V1` as the controlling composition authority.  
**Retains:** `GS_HOMEPAGE_VISUAL_MASTER_V1` as historical/supporting reference only.

## 1. Authority split

The new visual pack has two different authority classes.

### A. Integrated Targets — visual composition authority

These are **not runtime assets** and are not content truth. They define the intended relationship between production imagery and real DOM:

- geometry;
- relative scale;
- negative space;
- alignment;
- hierarchy;
- spatial rhythm;
- stage continuity;
- lighting relationship;
- image/DOM integration;
- approximate placement of controls, copy, project media, and connectors.

Files:

1. `docs/visual/gs-home-v2/integrated-targets/01_GS_Hero_K01_Approved.webp`
2. `docs/visual/gs-home-v2/integrated-targets/02_GS_Hero_K02_Approved.webp`
3. `docs/visual/gs-home-v2/integrated-targets/03_GS_Hero_K03_Approved.webp`
4. `docs/visual/gs-home-v2/integrated-targets/04_GS_Hero_K04_Approved.webp`
5. `docs/visual/gs-home-v2/integrated-targets/05_GS_Solutions_Universe_Approved.webp`
6. `docs/visual/gs-home-v2/integrated-targets/06_GS_Selected_Work_Approved.webp`
7. `docs/visual/gs-home-v2/integrated-targets/07_GS_System_Anatomy_Approved.webp`
8. `docs/visual/gs-home-v2/integrated-targets/08_GS_Final_Gateway_Approved.webp`

Generated text, logos, metrics, screenshots, claims, contact data, and UI labels visible inside these images are **not content authority**.

### B. Clean Production Assets — runtime visual material

These are the approved clean visual environments/materials to be integrated into the actual frontend:

1. `src/assets/gs-home-v2/01_GS_Hero_Clean_Production_Asset.webp`
2. `src/assets/gs-home-v2/02_GS_Solutions_Universe_Clean_Production_Asset.webp`
3. `src/assets/gs-home-v2/03_GS_Selected_Work_Clean_Production_Asset.webp`
4. `src/assets/gs-home-v2/04_GS_System_Anatomy_Clean_Production_Asset.webp`
5. `src/assets/gs-home-v2/05_GS_Final_Gateway_Clean_Production_Asset.webp`

The original PNG masters remain retained outside this repository as owner source material. The repository WebP derivatives are high-quality executor/runtime copies prepared for W05 implementation; do not recompress or regenerate them during a section workstream.

## 2. Visual identity

Execution descriptor:

`Premium Digital Systems Atelier`

Interpretation:

- architectural;
- engineered;
- refined;
- believable;
- premium;
- calm rather than flashy;
- material rather than ornamental.

Warm gold/champagne light is **structural/material light**, not a generic accent color.
Cobalt blue is a **micro-signal for digital activation**, not the dominant palette.

Do not introduce:

- generic SaaS dashboard styling;
- generic card grids;
- broad glassmorphism;
- neon/purple tropes;
- random glow;
- sci-fi control-room clutter;
- detached floating UI panels where the asset provides an architectural zone.

## 3. Core image–DOM rule

**The final result must not read as `background image + HTML overlay`.**

For each section:

1. create one shared section coordinate system;
2. place the clean production asset and the real DOM inside that same system;
3. derive DOM zones from the image geometry before styling the controls;
4. align seams, borders, shadows, connectors, and active states to visible architectural/object anchors;
5. keep all semantic content in real DOM;
6. use the Integrated Target to judge the final relationship, not to copy its generated text.

Use Grid, local positioned layers, SVG connectors, masks/clips, and bounded absolute anchors when they improve fidelity. Do not use global absolute-positioning as a substitute for responsive composition.

## 4. Desktop-first execution

Primary fidelity viewport:

`1440px`

Do not optimize 768px and 390px at the same time as initial desktop composition.

Required order for every section:

`1440 composition → Controller screenshot review → 768 composition → 390 composition → final regression`

1024px is an intermediate regression viewport, not the first art-direction target.

## 5. Normalized composition map

Percentages below are approximate **authoring zones**, not pixel-perfect boxes. They are intended to prevent inversion of the approved composition.

### S01 — Hero

**Clean asset:** `01_GS_Hero_Clean_Production_Asset.webp`  
**Targets:** K01, K02, K03, K04.

Natural clean-asset size: `1024×576`.

Desktop shared geometry:

- Header safe band: `x 4–96%`, `y 3–11%`.
- Left architectural operating wall / interaction zone: `x 2–32%`, `y 14–84%`.
- Threshold / gateway structure: `x 31–53%`, `y 7–88%`.
- Right narrative / headline safe zone: `x 55–96%`, `y 14–77%`.
- Bottom stage rail: `x 5–94%`, `y 88–98%`.

Hero state contract:

`الاحتياج → الاتجاه → البناء → الإطلاق`

Visible stage bar uses those Arabic names only. Do not display `K01`, `K02`, `K03`, or `K04` to users.

**One clean asset only. Never swap four Hero background images.**

The four Integrated Targets define four DOM states over the same clean environment:

- K01: need selection is integrated into the left architectural wall.
- K02: direction selection reorganizes within the same wall/system.
- K03: build/product surface becomes the visual peak while remaining physically seated in the wall/system.
- K04: launch/settle state resolves without replacing the whole scene.

Header dimensions, stage-rail geometry, gateway location, and overall section frame remain stable across K01–K04.

Transition rule:

- no full-screen fade-out/fade-in;
- no slideshow behavior;
- prefer short transforms, size/position changes, connector activation, mask/clip changes, and restrained light-state changes;
- same system must visibly reconfigure itself.

### S02 — Solutions Universe

**Clean asset:** `02_GS_Solutions_Universe_Clean_Production_Asset.webp`  
**Target:** `05_GS_Solutions_Universe_Approved.webp`.

Natural clean-asset size: `1024×572`.

Desktop geometry:

- Core + station field: `x 3–69%`, `y 9–91%`.
- Explanatory DOM safe zone: `x 70–97%`, `y 13–84%`.
- Do not miniaturize the core to make room for six cards.

Six real family labels remain DOM:

1. مواقع الأعمال والخدمات
2. التجارة الرقمية وتجارب العلامات
3. الحجوزات والخدمات
4. العقارات والأصول
5. الأنظمة التشغيلية والبوابات
6. التعليم والمعرفة والمحتوى

Use the six visible station locations as semantic control anchors. Active state is communicated primarily through station/path/light response, then concise DOM explanation.

Do not recreate the six families as a detached card grid.

### S03 — Selected Work

**Clean asset:** `03_GS_Selected_Work_Clean_Production_Asset.webp`  
**Target:** `06_GS_Selected_Work_Approved.webp`.

Natural clean-asset size: `1024×640`.

Desktop geometry:

- Main theatre / real project media zone: `x 7–66%`, `y 14–68%`.
- Dominant desktop surface: approximately `x 18–54%`, `y 24–59%`.
- Supporting device surfaces: approximately `x 7–18%` and `x 54–67%`.
- Three secondary project plinths/selectors: `x 6–62%`, `y 70–95%`.
- Project heading/detail safe zone: `x 68–97%`, `y 12–88%`.

The empty display surfaces exist to receive **real project screenshots**. Do not draw fake dashboards or invented UI into them.

RP01–RP04 media must enter through real `<img>` or equivalent DOM media sources with clipping/perspective/ambient seating that matches the theatre.

No fake KPIs, fake percentages, fake outcomes, or fabricated evidence.

### S04 — System Anatomy

**Clean asset:** `04_GS_System_Anatomy_Clean_Production_Asset.webp`  
**Target:** `07_GS_System_Anatomy_Approved.webp`.

Natural clean-asset size: `1024×572`.

Desktop geometry:

- Copy + five-stage control rail: `x 4–41%`, `y 12–87%`.
- Connector bridge: `x 39–55%`.
- Exploded technical object: `x 50–97%`, `y 7–94%`.

Five customer-facing stages:

1. الاكتشاف
2. الاتجاه
3. البناء
4. التكامل
5. الإطلاق والنمو

Use one clear anchor/connector per layer where possible. The object should remain visually primary. Avoid infographic wiring clutter.

### S05 — Final Gateway

**Clean asset:** `05_GS_Final_Gateway_Clean_Production_Asset.webp`  
**Target:** `08_GS_Final_Gateway_Approved.webp`.

Natural clean-asset size: `1024×640`.

Desktop geometry:

- Doorway / architectural threshold: `x 4–45%`, `y 6–96%`.
- CTA/headline safe zone: `x 53–96%`, `y 16–82%`.
- Golden path at lower center is the primary relationship between action and gateway.

No large CTA card or glass panel. Copy and buttons live directly in the right negative space.

## 6. Responsive art direction

### 768px

Recompose each section rather than proportionally scaling desktop. Preserve the dominant visual object and move/reflow semantic DOM around it.

### 390px

- preserve one strong visual focal point per section;
- avoid miniature desktop layouts;
- avoid long low-information dark gaps;
- allow side-by-side structures to become vertical when necessary;
- preserve interaction order and semantic relationships;
- do not crop away the principal gateway/core/theatre/anatomy object.

Section-specific crop/fit rules override any generic `cover` rule.

## 7. Typography and RTL

Integrated Targets govern hierarchy and approximate line rhythm, not generated font identity.

Production requirements:

- Arabic-first RTL;
- intentional Arabic line breaks;
- correct mixed RTL/LTR runs;
- no Arabic/English collisions;
- English identifiers remain LTR;
- stable button/control labels;
- readable secondary type;
- no generated text from targets copied as product truth.

## 8. Accessibility

All functional meaning stays in semantic DOM:

- headings;
- buttons;
- selectors;
- project names;
- state labels;
- links;
- focus states;
- keyboard operation;
- pointer/touch operation;
- reduced-motion behavior.

Decorative production imagery is not semantic content and should not create noisy screen-reader output.

## 9. Performance and asset handling

- use the prepared WebP derivatives;
- preserve the owner PNG masters outside runtime;
- do not silently recompress V2 derivatives during a section workstream;
- do not duplicate-load the same environment;
- Hero may be high priority; lower sections should load appropriately;
- avoid third-party image/CDN dependencies;
- avoid new animation dependencies when CSS/React state is sufficient;
- preserve mineral texture and subtle lighting.

## 10. Section execution sequence

The V2 implementation is deliberately section-by-section:

1. `W05-V2-A — Hero K01–K04`
2. `W05-V2-B — Solutions Universe`
3. `W05-V2-C — Selected Work Theatre`
4. `W05-V2-D — System Anatomy`
5. `W05-V2-E — Final Gateway`
6. `W05-V2-F — Responsive + Full-page Integration Closure`

Do not start the next section before the Controller has directly reviewed the 1440 screenshot comparison for the current section.

## 11. Visual evidence gate

For every section, evidence must include:

- exact implementation head;
- 1440 real-browser screenshot(s) of all material states;
- the corresponding Integrated Target reference(s);
- interaction verification required by the section;
- no horizontal overflow;
- final responsive captures when authorized.

Hero requires four separate 1440 state screenshots for K01–K04.

Controller acceptance question:

> Does the viewer feel that the production image and the interface were designed at the same time?

If the answer is “the image is beautiful and the UI is beautiful, but they are separate layers,” the section fails visual acceptance.

## 12. Content truth and S03 proof rule

The Integrated Targets do not authorize their generated:

- names;
- copy;
- screenshots;
- logos;
- metrics;
- KPIs;
- outcomes;
- contact information;
- claims.

S03 must remain structurally ready for real RP01–RP04 screenshots. Until authoritative real project media is supplied, do not invent proof to fill the screens.

## 13. Stop rule

A section executor stops at the exact Workstream Contract gate.

No executor may:

- approve its own visual result;
- merge;
- update canonical Drive state;
- start the next section;
- expand into internal pages/backend/auth/analytics/deployment/release;
- generate replacement visual assets without new authority.
