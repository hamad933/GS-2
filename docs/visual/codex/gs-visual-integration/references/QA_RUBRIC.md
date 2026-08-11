# GS Visual Integration — QA Rubric

This rubric supports executor self-review and Controller review. It does not create owner acceptance.

Score visual categories `0–5` using rendered evidence against the corresponding Integrated Target.

For a major GS visual section to be **Controller-review-ready**:

- no scored visual category may be below `4`;
- `Reference Fidelity`, `Image–DOM Integration`, `Artistic Quality`, `Material Believability`, and `Composition / Rhythm` must each be `5` or have only explicitly documented minor residual differences that do not reduce the target's visual intent;
- no accessibility/input blocker may exist;
- required exact-head evidence must exist;
- the Controller must independently inspect screenshots rather than inherit executor scores.

Even after `CONTROLLER VISUAL PASS`, integration into the accepted major visual baseline requires explicit `OWNER VISUAL ACCEPTANCE` unless a later governed owner decision changes that rule.

## 1. Reference Fidelity

5 — The rendered composition strongly preserves the target's hierarchy, scale, anchors, negative space, spatial narrative, and state-specific intent.
4 — The target is clearly preserved with small non-material deviations.
3 — Correct ingredients, but important geometry/hierarchy/craft has drifted.
2 — Asset is present while the composition remains generic or materially different.
1 — Mostly unrelated visual interpretation.
0 — Target was not used meaningfully.

## 2. Image–DOM Integration

5 — Semantic interface and visual environment feel authored as one physical/architectural system; seams, depth, anchors, light, and controls belong together.
4 — Strong seating with only minor visible separation.
3 — Some alignment exists, but parts still read as an overlay.
2 — Background image + UI layer.
1 — Detached cards/panels dominate.
0 — No meaningful integration.

## 3. Artistic Quality

5 — High craft, sophisticated visual judgment, controlled detail, intentional focal hierarchy, and a premium finished feeling comparable to the target.
4 — Strong art direction with limited polish gaps.
3 — Competent but visibly under-authored or ordinary.
2 — Functional visual styling with primitive or crude execution.
1 — Poorly composed.
0 — No meaningful art direction.

## 4. Originality / Non-template Quality

5 — The result feels specifically authored for GS and the approved environment; it avoids generic component-library language.
4 — Distinctive overall with a few conventional details.
3 — Mix of authored and generic SaaS/dashboard patterns.
2 — Mostly generic cards/panels/layout conventions.
1 — Template-like.
0 — Unrelated generic UI.

## 5. Material Believability

5 — DOM surfaces convincingly inherit the environment's material boundaries, depth, recesses, edge light, shadow, and structural illumination.
4 — Believable with small seams or lighting mismatches.
3 — Depth/material treatment exists but is decorative rather than structural.
2 — Flat boxes over imagery.
1 — Visual materials conflict.
0 — No material relationship.

## 6. Typography / RTL

5 — Arabic hierarchy, line breaks, spacing, mixed-direction runs, density, and placement are intentionally composed and premium.
4 — Strong with minor polish items.
3 — Readable but mechanical.
2 — Multiple hierarchy/spacing/direction problems.
1 — Major RTL defects.
0 — Unusable.

## 7. Composition / Rhythm

5 — Scale, focal balance, density, negative space, pacing, alignment, and visual weight feel deliberate and match the target's narrative.
4 — Strong composition with small rhythm issues.
3 — Usable but uneven, empty, crowded, or overly dominant in material areas.
2 — Primitive or mechanically distributed layout.
1 — Broken hierarchy.
0 — No coherent composition.

## 8. Interaction Choreography

5 — State changes are causal, spatially meaningful, visually distinct, restrained, and appropriate to the target; the visual peak/resolution is unmistakable.
4 — Strong continuity with minor rough edges.
3 — Functional but states are too similar or rely on generic reveal/fade behavior.
2 — Mostly replacement states or generic wizard behavior.
1 — Carousel/slideshow-like.
0 — Broken.

## 9. Responsive Art Direction

Score only when responsive closure is authorized.

5 — Desktop/tablet/mobile each feel intentionally re-authored while preserving narrative and dominant objects.
4 — Strong across breakpoints with small compromises.
3 — Usable but visibly scaled/cropped from desktop.
2 — Major dead space, miniature art, or compromised hierarchy.
1 — Broken composition.
0 — Unusable.

For a desktop-only workstream, mark this category `NOT IN CURRENT GATE`; do not fabricate a responsive score.

## 10. Owner Visual Satisfaction

This is **not executor-scored** and is not inferred by the Controller.

Allowed states:

- `PENDING OWNER REVIEW`
- `OWNER VISUAL ACCEPTANCE`
- `OWNER VISUAL REJECT`

For major GS visual sections, only explicit owner feedback may set this category. `CONTROLLER VISUAL PASS` leaves it at `PENDING OWNER REVIEW`.

## Technical blocking conditions

A visual result is not review-ready if any apply:

- keyboard, pointer/touch, focus, reduced-motion, or semantic behavior is materially broken;
- required real content/labels are replaced by generated target text;
- fabricated project evidence, KPIs, metrics, claims, logos, screenshots, or contact data appear;
- unnecessary dependency or asset duplication is introduced;
- required exact-head screenshots or workflow evidence are missing.

## Mandatory visual rejection conditions

Reject and continue refining if any apply:

- clean asset is treated as wallpaper;
- result is technically clean but materially primitive compared with the Integrated Target;
- generic card/dashboard/SaaS treatment dominates the composition;
- generated text from a target is copied as product truth;
- Hero swaps four background images;
- Hero K01–K04 are mechanically similar rather than a living system with a clear build peak and launch resolution;
- a large generic glass/card shell covers the architectural safe zone;
- Solutions becomes six cards;
- Selected Work uses fake dashboards/KPIs;
- Anatomy becomes a wiring-heavy generic infographic;
- Gateway receives a large CTA card;
- mobile is only a scaled-down desktop when responsive review is in scope;
- a real pointer/touch or keyboard path is blocked.
