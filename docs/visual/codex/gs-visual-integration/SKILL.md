---
name: gs-visual-integration
description: Use for General Solutions homepage visual implementation or review when integrating the owner-approved GS W05 V2 Integrated Targets with Clean Production Assets. Enforces target-to-asset mapping, shared image/DOM coordinate systems, Arabic RTL premium composition, desktop-first fidelity, responsive art direction, screenshot comparison gates, accessibility, and performance. Do not use to invent a new design system, generated content, fake project evidence, or unrelated pages.
---

# GS Visual Integration

This skill is a procedural aid. It does **not** outrank the Workstream Contract or the active GS visual authority.

## Required sources

Before editing:

1. Read `docs/visual/README.md`.
2. Read `docs/visual/GS_W05_VISUAL_INTEGRATION_MANIFEST_V2.md`.
3. Read only the Integrated Target(s) and Clean Production Asset(s) for the authorized section.
4. Read `references/QA_RUBRIC.md` before self-review.

## Workflow

### 1. Map before code

Write a short local implementation map for the authorized section:

- target file;
- clean asset;
- DOM zones;
- image anchors;
- interactive states;
- desktop crop/fit rule;
- 768 rule;
- 390 rule;
- evidence screenshots.

Do not begin CSS by treating the clean asset as an afterthought.

### 2. Build one shared visual coordinate system

The image and DOM must live in one authored section system.

Prefer:

- section-local Grid;
- local positioned layers;
- semantic DOM;
- SVG connectors when needed;
- masks/clips;
- restrained shadow and edge light;
- CSS/React state for choreography.

Avoid:

- generic cards;
- global glassmorphism;
- random glow;
- detached overlays;
- blind `background-size: cover`;
- full-screen state replacement.

### 3. Match 1440 first

Implement the 1440 composition against the relevant Integrated Target before optimizing other breakpoints.

Check:

- major object placement;
- copy safe zone;
- hierarchy;
- relative scale;
- negative space;
- controls seated in the architecture/object;
- connector alignment;
- state continuity.

Do not proceed merely because the page is functional.

### 4. State choreography

For Hero K01–K04, use the same clean asset in all states.

Transform the real DOM/system through position, size, layout, mask/clip, connector, and subtle light-state changes. Never swap four background scenes.

### 5. Responsive art direction

After desktop is strong, re-author 768 and 390.

Do not scale the complete scene down proportionally. Preserve the dominant visual object and move/reflow DOM around it.

### 6. Accessibility and RTL

Keep semantic controls, keyboard access, visible focus, real pointer/touch, reduced motion, and correct mixed RTL/LTR behavior.

Decorative raster assets must not become semantic content.

### 7. Performance

Use the repository V2 WebP derivatives without recompressing them in the section workstream. Avoid duplicate loads and new image/CDN dependencies.

### 8. Screenshot gate

Before handoff, compare the real 1440 implementation directly with its Integrated Target.

If image and DOM still look like separate layers, continue refining.

Use `references/QA_RUBRIC.md` for the final scored self-review.

## Stop

Stop at the Workstream Contract's review gate. Do not merge, update Drive, start the next section, or broaden scope.
