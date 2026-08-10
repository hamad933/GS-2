# GS Visual Integration — QA Rubric

Score each category `0–5`.

A section is review-ready only when:

- no category is below `4`;
- `Image–DOM Integration` is at least `4`;
- `Composition Fidelity` is at least `4`;
- there is no accessibility/pointer blocker;
- required evidence exists on the exact head.

## 1. Composition Fidelity

5 — Major object, copy zone, interaction zone, scale, hierarchy, and negative space strongly match the Integrated Target.  
4 — Minor deviations only; composition intent is unmistakable.  
3 — Correct ingredients but notable geometry/hierarchy drift.  
2 — Asset is present but layout remains generic.  
1 — Mostly unrelated composition.  
0 — Target not used meaningfully.

## 2. Image–DOM Integration

5 — Interface feels physically authored with the environment.  
4 — Strong seating/alignment with only small seams.  
3 — Some aligned elements, but the DOM still reads as an overlay in places.  
2 — Background image + UI layer.  
1 — Detached cards dominate.  
0 — No meaningful integration.

## 3. State / Interaction Choreography

5 — State change is causal, precise, calm, and spatially meaningful.  
4 — Good continuity with small rough edges.  
3 — Functional but some slide/fade behavior remains.  
2 — Mostly replacement states.  
1 — Generic wizard/carousel behavior.  
0 — Broken.

## 4. Typography / RTL

5 — Arabic hierarchy, line breaks, mixed-direction text, spacing, and labels feel intentionally composed.  
4 — Strong with minor polish items.  
3 — Readable but mechanically placed.  
2 — Multiple spacing/direction/hierarchy issues.  
1 — Major RTL defects.  
0 — Unusable.

## 5. Responsive Art Direction

5 — Desktop/tablet/mobile each feel authored while preserving narrative.  
4 — Strong across breakpoints with small compromises.  
3 — Usable but visibly scaled/cropped from desktop.  
2 — Major dead space, miniature art, or compromised hierarchy.  
1 — Broken composition.  
0 — Unusable.

## 6. Accessibility / Input

5 — Keyboard, pointer/touch, focus, reduced motion, semantics, and state communication are all strong.  
4 — Requirements pass with minor non-blocking polish.  
3 — Mostly passes but one meaningful issue remains.  
2 or below — not review-ready.

## 7. Performance / Asset Discipline

5 — Correct derivative, sensible loading priority, no duplicate asset load, no new unnecessary dependency.  
4 — Sound with minor optimization deferred.  
3 — Avoidable inefficiency but no severe regression.  
2 or below — not review-ready.

## Mandatory rejection conditions

Reject and continue refining if any apply:

- clean asset is treated as wallpaper;
- generated text from a target is copied as product truth;
- Hero swaps four background images;
- a large generic glass/card shell covers the architectural safe zone;
- Solutions becomes six cards;
- Selected Work uses fake dashboards/KPIs;
- Anatomy becomes wiring-heavy infographic;
- Gateway receives a large CTA card;
- mobile is only a scaled-down desktop;
- a real pointer/touch or keyboard path is blocked.
