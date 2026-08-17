# AGENTS.md — GS-2 Repository Execution Contract

## Authority and precedence

For work in `hamad933/GS-2`, use authority in this order:

1. approved owner decisions and the current governed GS control state;
2. the exact authorized bounded Workstream Contract;
3. this file and repository governance documents;
4. direct GitHub state for branches, commits, pull requests, checks, and technical artifacts;
5. historical material as reference only.

A workstream may narrow scope or add stricter requirements. It must not silently expand authority or override owner-reserved decisions.

## Repository and product boundary

This repository is the current GS execution repository and already contains an inherited React/Vite frontend implementation. Preserve that verified baseline unless a bounded workstream explicitly authorizes a stack, dependency, architecture, or product change.

GS is a premium reference-product and solution-selection website. `RP01`, `RP02`, `RP03`, and `RP04` remain independent products. Do not copy their applications or full product truth into GS.

Never fabricate or imply unsupported clients, customer logos, testimonials, metrics, performance numbers, uptime, latency, prices, delivery times, guarantees, integrations, production security, or operational evidence. Demo or illustrative material must be unmistakably identified as such.

## Minimum reading order

Read only the minimum complete set required for the authorized work:

1. `AGENTS.md`
2. the exact authorized Workstream Contract, including repository, exact base/head requirements, branch, PR target, scope, exclusions, validation, evidence, merge authority, and Stop Gate
3. `CONTRIBUTING.md`
4. `docs/governance/EXECUTION_AND_SAFETY.md`
5. `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md` when executor route, assets, GitHub Actions, evidence transfer, or Skills are material
6. `docs/governance/EVIDENCE_AND_HANDOFF.md`
7. `docs/architecture/README.md` when architecture, dependencies, runtime, integrations, hosting, or deployment are in scope
8. `docs/visual/README.md` when UI, journeys, visual behavior, content presentation, accessibility, RTL/LTR, or visual evidence is in scope
9. only the direct references explicitly required by the workstream

Do not broaden the task into unrelated repository, visual, archive, or portfolio analysis.

## Homepage W05 V2 visual authority

When a bounded workstream explicitly places W05 V2 homepage visual implementation or review in scope, after `docs/visual/README.md` read:

1. `docs/visual/GS_W05_VISUAL_INTEGRATION_MANIFEST_V2.md`
2. `docs/visual/codex/gs-visual-integration/SKILL.md`
3. `docs/visual/codex/gs-visual-integration/references/QA_RUBRIC.md`
4. only the Integrated Target(s) and Clean Production Asset(s) for the authorized section

The W05 manifest is the homepage visual-integration authority for that bounded scope. The repository-local skill is a procedural aid, not an authority override and not proof that a product Skill is installed or active.

Do not assume repository-local skills are auto-discovered by any ChatGPT or Codex surface. The Workstream Contract must explicitly identify repository-local guidance it requires, and any product Skill or plugin relied on must be independently verified in the chosen execution environment.

## Current whole-public-site validation and evidence

The current repository-native whole-public-site harnesses are:

- `tests/visual/public-site.integration.spec.ts` for integrated public-site behavior and route validation;
- `tests/visual/public-site.evidence.spec.ts` for current public-site screenshot evidence.

`tests/visual/hero.visual.spec.ts` remains homepage/Hero-specific. It is not the generic future evidence contract for the whole GS public site, and a hardcoded W05 screenshot-name manifest must not be treated as repository-wide governance.

## Execution rules

Before editing, verify the repository, exact authorized base commit, working branch, PR target, authorized paths, required validation, evidence requirements, merge authority, and Stop Gate.

During execution:

- work only on the authorized workstream branch and submit changes to the exact PR target named by the Workstream Contract;
- never infer that every PR targets `main`; stacked or intermediate targets are valid only when the exact Workstream Contract authorizes them;
- treat a stacked PR target as an execution/integration target, not as permission for an executor to merge or write directly to `main`;
- keep changes bounded, reviewable, reversible where practical, and limited to authorized paths and behavior;
- do not force-push or rewrite shared history;
- change dependencies only when the workstream explicitly authorizes it;
- do not introduce secrets, credentials, private data, or unsupported commercial/evidence claims;
- do not write to Google Drive as an executor;
- preserve evidence integrity and tie claims to the exact base, head commit, PR, check, workflow run, or artifact being reviewed;
- preserve `REFERENCE_ONLY` evidence semantics unless a separately authorized governance action promotes evidence;
- do not implement or absorb RP01–RP04 inside GS;
- stop rather than infer authority when the requested outcome exceeds the contract.

## Review and acceptance boundaries

Executor self-review, a green check, an evidence artifact, or an open PR is evidence, not acceptance.

The Controller reviews governance sufficiency and execution evidence. Controller review or `CONTROLLER VISUAL PASS` does not become `OWNER VISUAL ACCEPTANCE`. Where owner acceptance is reserved by the governed control state or Workstream Contract, only explicit owner acceptance satisfies that gate.

The executor must not approve or merge their own work. Mainline integration, release, publication, deployment, canonical Drive updates, and other owner- or Controller-reserved actions remain outside executor authority unless an exact later contract explicitly grants them.

## Stop Gate

When the authorized Stop Gate is reached, stop. Do not merge, release, deploy, publish, update canonical Drive state, retarget the PR, or begin the next workstream without new authority.
