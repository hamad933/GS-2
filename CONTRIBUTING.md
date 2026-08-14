# Contributing to GS-2

## Workstream branches and targets

Every change after a verified baseline uses the exact authorized, workstream-scoped branch and the exact PR target named by the current bounded Workstream Contract. Common branch patterns include:

- `governance/<id>`
- `feature/<id>`
- `fix/<id>`
- `chore/<id>`

An explicitly authorized branch name takes precedence over naming conventions.

Do not implement directly on `main`. Do not force-push, rewrite shared history, reuse a branch for unrelated work, or bypass the authorized review path.

There is no universal repository rule that every PR targets `main`. A stacked or intermediate PR may target another verified branch when the Workstream Contract explicitly authorizes that target. Never infer or retarget a PR from convention. A non-main PR target does not grant executor authority to integrate into `main`.

## Commits and dependencies

Keep commits focused, coherent, and attributable to the authorized scope. Avoid unrelated formatting or cleanup.

Dependency additions, removals, upgrades, package-manager changes, and lockfile changes require explicit workstream authority. When dependency work is authorized, preserve reproducibility and record the exact resulting lockfile and validation evidence.

## Pull requests

A PR must remain bounded to one authorized workstream and use the exact authorized PR target.

Record, as applicable:

- workstream ID and governing authority;
- exact verified base commit and exact head commit;
- working branch and authorized PR target;
- changed paths and implementation/governance summary;
- validation commands and exact results;
- CI/workflow runs and evidence classification;
- limitations, deviations, blockers, and unexpected findings;
- reviewer entry point and acceptance authority;
- merge authority and Stop Gate.

For stacked work, preserve the frozen parent baseline and do not overwrite, merge, close, or retarget the parent branch/PR unless separately authorized.

## Validation and evidence

Run exactly the validation required by the Workstream Contract and report failures as failures. Evidence must identify the exact base, head commit, PR, check, workflow run, or artifact it proves. Do not substitute executor narrative for direct evidence.

Follow `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md` for executor-route boundaries, canonical asset handling, remote validation/evidence, billing/platform blockers, and instruction-layer distinctions.

`REFERENCE_ONLY` is the default technical-evidence classification unless the governed evidence policy and an authorized Controller/owner action explicitly promote it. Executors do not write evidence to Google Drive.

Never commit secrets, credentials, unrestricted private data, generated dependency caches, transient logs, or fabricated product/commercial evidence.

## Review and merge

Executors may self-check their work but may not self-approve or merge it.

Controller review is distinct from owner acceptance. Where owner acceptance is reserved, a Controller pass, green CI, or evidence artifact cannot satisfy it.

The authority named by the current governed control state and Workstream Contract determines acceptance and merge. Direct executor writes or merges to `main` are prohibited unless a later exact contract explicitly grants that action.

Stop when the required PR and handoff are review-ready or when the Workstream Contract Stop Gate is reached. Do not continue into the next workstream without explicit authorization.
