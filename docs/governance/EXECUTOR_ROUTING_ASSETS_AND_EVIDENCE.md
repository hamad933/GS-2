# Executor Routing, Assets, and Remote Evidence

## Purpose and authority

This document defines stable repository rules for selecting an execution route, handling canonical binary assets, and producing reviewable remote evidence for `hamad933/GS-2`.

It does not authorize work by itself. The current governed GS control state and the exact bounded Workstream Contract remain higher authority. The Workstream Contract supplies the repository, exact base/head constraints, branch, PR target, write scope, validation, evidence, merge authority, and Stop Gate for each execution.

## Executor-route selection

Use an execution environment only when it can satisfy the bounded task without silently transferring technical work to the owner.

Before mutation, verify the capabilities that the Workstream Contract actually requires, such as:

- direct inspection of the exact GitHub repository, base commit, branch, PR, diff, checks, and artifacts;
- bounded repository writes to the authorized branch and paths;
- creation or update of the authorized PR when required;
- access to required governed references;
- access to the validation/evidence route required for handoff.

If a required capability is unavailable, stop and report the unavailable route or platform condition. Do not replace a missing native route with routine owner-mediated patch, ZIP, binary, screenshot, or log transfer unless the Workstream Contract or Controller explicitly authorizes that exception.

Repository-local instruction files do not prove that a product capability exists.

## Canonical binary assets

When production binary assets are authorized:

1. identify the governed source and intended runtime role;
2. verify format, dimensions, visual identity, and provenance as applicable;
3. ingest the asset once through an authorized byte-preserving native route;
4. place it at the canonical repository path named by the workstream;
5. tie the resulting repository state to the exact commit/PR evidence;
6. reference that canonical repository path in later work instead of repeatedly re-uploading the asset.

Do not treat chat-attachment ordering, normalized filenames, or transport-modified bytes as canonical identity unless that transport behavior was directly verified.

Google Drive or another governed source may remain the authority for source masters, but executors do not write canonical Drive state unless a later exact authority explicitly grants that action.

## GitHub Actions validation and evidence

When GitHub Actions is the authorized validation/evidence route, workflows should preserve review traceability by using the minimum applicable controls:

- checkout the exact PR head commit rather than an implicit merge result when exact-head evidence is required;
- verify the checked-out SHA explicitly;
- validate PR diff integrity where applicable;
- run only the lint/typecheck/build/browser checks required by repository/workstream governance;
- use deterministic browser execution and stable repository-native harnesses when visual evidence is required;
- tie uploaded artifact names or metadata to the exact tested head SHA;
- fail when required evidence is absent rather than manufacturing a pass.

Visual evidence for the current public site uses the repository-native whole-site harnesses named in `docs/visual/README.md`. Homepage/Hero-specific harnesses remain available for bounded homepage work but are not the generic future whole-site evidence contract.

GitHub Actions checks and artifacts are technical evidence. They are `REFERENCE_ONLY` by default and do not authorize merge or establish owner acceptance.

If a required Actions run cannot execute because GitHub reports a billing/platform restriction, classify it exactly as `PLATFORM/BILLING BLOCKED`. Do not convert that condition into an implementation pass or fail.

## Skills and instruction layers

Keep these layers distinct:

1. **Installed/active product Skill or plugin** — a product capability whose availability must be directly verified in the chosen execution environment.
2. **Repository-local `SKILL.md`** — versioned procedural guidance in GitHub; its existence does not prove product installation or automatic activation.
3. **`AGENTS.md` and repository governance** — stable repository execution rules.
4. **Workstream Contract** — the exact task authority, scope, target, validation, evidence, merge authority, and Stop Gate.

No lower layer may silently override a higher-authority workstream or owner decision.

## Review, acceptance, and Stop Gate

Executor self-review, technical checks, and evidence artifacts do not constitute acceptance. Executors do not self-approve or self-merge.

Controller review determines the Controller verdict within its authority. A Controller verdict is not an owner verdict. Where the governed control state reserves acceptance to the owner, only explicit owner acceptance satisfies that gate.

Stop at the exact Workstream Contract Stop Gate. Do not merge, release, deploy, publish, update canonical Drive state, retarget governed PRs, or begin a later workstream without new authority.
