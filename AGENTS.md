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
2. the exact authorized Workstream Contract, including scope, exclusions, evidence, merge authority, and Stop Gate
3. `CONTRIBUTING.md`
4. `docs/governance/EXECUTION_AND_SAFETY.md`
5. `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md` when executor route, binary assets, manual transfer, Desktop/Cloud execution, GitHub Actions evidence, or Skills are material
6. `docs/governance/EVIDENCE_AND_HANDOFF.md`
7. `docs/architecture/README.md` when architecture, dependencies, runtime, integrations, hosting, or deployment are in scope
8. `docs/visual/README.md` when UI, journeys, visual behavior, content presentation, accessibility, or RTL/LTR work is in scope
9. only the direct references explicitly required by the workstream

Do not broaden the task into unrelated repository, visual, archive, or portfolio analysis.

## GS homepage visual work

For any authorized GS homepage visual implementation or visual review under the active W05 V2 direction, after `docs/visual/README.md` read:

1. `docs/visual/GS_W05_VISUAL_INTEGRATION_MANIFEST_V2.md`
2. `docs/visual/codex/gs-visual-integration/SKILL.md`
3. `docs/visual/codex/gs-visual-integration/references/QA_RUBRIC.md`
4. only the Integrated Target(s) and Clean Production Asset(s) for the authorized section

The manifest is the active stable visual-integration contract. The repository-local skill is a procedural aid, not an authority override and not proof of an installed product Skill.

Do not assume repository-local skills are auto-discovered by any ChatGPT or Codex surface. The Workstream Contract must explicitly instruct the executor to read the required repository path and must separately verify any installed/active product Skill it intends to rely on.

## Execution rules

Before editing, verify the repository, exact base commit, working branch, PR target, authorized scope, required validation, and Stop Gate.

During execution:

- work only on the authorized workstream branch and submit changes through the authorized PR target;
- keep changes bounded, reviewable, reversible where practical, and limited to authorized paths and behavior;
- do not force-push or rewrite shared history;
- change dependencies only when the workstream explicitly authorizes it;
- do not introduce secrets, credentials, private data, or unsupported commercial/evidence claims;
- do not write to Google Drive as an executor;
- preserve evidence integrity and tie claims to the exact commit, PR, check, run, or artifact being reviewed;
- follow the no-manual-transfer and binary-asset rules in `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md`;
- do not implement or absorb RP01–RP04 inside GS;
- stop rather than infer authority when the requested outcome exceeds the contract.

## Major visual acceptance

For major GS visual work:

- executor self-review is not acceptance;
- green CI/Visual Evidence is not visual acceptance;
- `CONTROLLER VISUAL PASS` is not `OWNER VISUAL ACCEPTANCE`;
- explicit owner visual acceptance is required before integrating a major visual section into the accepted visual baseline unless a later governed owner decision changes this policy.

## Role separation

The executor implements bounded changes, validates them, and provides the handoff. The Controller reviews governance sufficiency and execution evidence. The executor must not approve or merge their own work. Owner- or Controller-reserved merge, release, publication, deployment, Drive updates, and destructive actions remain outside executor authority unless explicitly authorized.

## Stop Gate

When the authorized Stop Gate is reached, stop. Do not merge, release, deploy, publish, update canonical Drive state, or begin the next workstream without new authority.
