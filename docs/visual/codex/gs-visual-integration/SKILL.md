---
name: gs-visual-integration
description: Use for General Solutions homepage visual implementation or review when integrating the owner-approved GS W05 V2 Integrated Targets with Clean Production Assets. Enforces target analysis, shared image/DOM coordinate systems, premium Arabic RTL composition, material/light integration, desktop-first fidelity, responsive art direction, screenshot-driven iteration, accessibility, and performance. Do not use to invent product truth, fake project evidence, unrelated pages, or generic SaaS styling.
---

# GS Visual Integration

This repository-local file is a procedural aid. It does **not** outrank the Workstream Contract or active GS visual authority, and its existence does not prove that a product Skill is installed or active.

## Required sources

Before editing:

1. Read `docs/visual/README.md`.
2. Read `docs/visual/GS_W05_VISUAL_INTEGRATION_MANIFEST_V2.md`.
3. Read only the Integrated Target(s) and Clean Production Asset(s) for the authorized section.
4. Read `references/QA_RUBRIC.md` before self-review.

## Visual-first workflow

### 1. Diagnose the target before code

Inspect the actual target image, not only its filename or geometry notes. Identify:

- primary visual anchor and focal hierarchy;
- architectural/material boundaries;
- negative-space map;
- DOM seating zones;
- depth planes and overlap relationships;
- light direction and structural illumination;
- typography scale, rhythm, and line-break behavior;
- state-specific visual transformation;
- elements that make the composition original rather than template-like;
- the largest visual gap between the current implementation and the target.

For an existing implementation, inspect its rendered screenshot beside the target before editing. Describe why it fails visually in terms of composition, material seating, scale, rhythm, craft, originality, and state choreography—not only CSS symptoms.

### 2. Write a short Visual Integration Plan

Before implementation, create a concise internal plan covering:

- target file;
- clean asset;
- dominant anchors and negative space;
- semantic DOM zones;
- material/light relationships the DOM must inherit;
- interactive states and the intended visual peak;
- what existing structure can remain;
- what bounded JSX/CSS structure should be replaced if it prevents fidelity;
- evidence screenshots.

Do not begin by preserving a weak DOM merely because it already exists. Preserve functional truth, accessibility, and governed content—not poor visual execution.

### 3. Build one authored coordinate/material system

The image and DOM must live in one authored section system.

Prefer, when they improve fidelity:

- section-local Grid;
- local positioned layers;
- semantic DOM;
- SVG connectors;
- masks/clips;
- pseudo-elements for material seams and controlled edge light;
- restrained depth/shadow treatment;
- CSS/React state for choreography.

Controls should appear seated in the visual architecture through shared edges, recesses, connectors, light response, alignment, and depth—not simply placed above a background.

Avoid:

- generic cards or dashboard panels;
- broad glassmorphism;
- random glow;
- detached overlays;
- blind `background-size: cover`;
- neon/purple visual tropes;
- excessive borders;
- sci-fi control-room clutter;
- full-screen state replacement;
- technically tidy but visually primitive boxes.

### 4. Match 1440 as an art-directed composition

Implement the 1440 composition against the Integrated Target before optimizing other breakpoints.

Judge the rendered result for:

- major-object placement and relative scale;
- negative-space use;
- hierarchy and rhythm;
- material believability;
- DOM seating into the architecture;
- connector/light continuity;
- premium Arabic typography;
- originality and authored craft.

Do not proceed merely because the page is functional, clean, or close to the manifest percentages. Geometry notes prevent inversion; the image remains the visual truth.

### 5. State choreography

For Hero K01–K04, use the same clean asset in all states.

The same system must visibly reconfigure itself. Use position, scale, layout, reveal, mask/clip, connector, material depth, and restrained light-state changes where appropriate.

Each state must have a distinct visual purpose. K03 must read as the build/product visual peak; K04 must read as a resolved launch/settle state. Do not make four mechanically similar panels with different copy.

Never turn the Hero into a carousel, slideshow, generic wizard, or four swapped background scenes.

### 6. Screenshot-driven iteration

After a meaningful implementation pass:

1. render the required 1440 state screenshots;
2. compare each screenshot directly with its corresponding Integrated Target;
3. identify the three largest visual divergences;
4. correct the divergences that materially improve fidelity/craft;
5. repeat until the section reaches the Workstream review gate.

Do not use an executor self-score as evidence of visual quality. Do not claim visual acceptance from lint/build/CI.

### 7. Responsive art direction

Only after desktop acceptance is authorized, re-author 768 and 390.

Do not scale the complete scene down proportionally. Preserve the dominant visual object and recompose semantic DOM around it while retaining narrative and interaction order.

### 8. Accessibility and RTL

Keep semantic controls, keyboard access, visible focus, real pointer/touch behavior, reduced motion, correct Arabic direction, intentional Arabic line breaks, and correct mixed RTL/LTR runs.

Decorative raster assets must not become semantic content.

### 9. Performance

Use approved repository runtime assets without unnecessary duplicate loads or new image/CDN dependencies. Do not recompress governed derivatives during a section workstream. Do not introduce an animation dependency when CSS/React state is sufficient.

### 10. Owner-quality threshold

A result is not review-ready merely because it is technically correct.

Reject your own pass and continue refining when the output is materially:

- more generic than the target;
- flatter or more primitive than the target;
- less art-directed or less original than the target;
- visibly `background + HTML overlay`;
- dependent on generic card/dashboard language;
- weak in material/light integration;
- mechanically composed in Arabic RTL;
- insufficiently differentiated across interactive states.

Use `references/QA_RUBRIC.md` for structured self-review, but remember that major GS visual integration requires independent Controller review and explicit owner visual acceptance.

## Stop

Stop at the Workstream Contract's review gate. Do not merge, update Drive, start the next section, or broaden scope.
