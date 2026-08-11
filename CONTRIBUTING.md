# Contributing to GS-2

## Workstream branches

Every change after the verified baseline uses an authorized, workstream-scoped branch and the exact PR target named by the current bounded Workstream Contract. Recommended patterns are:

- `governance/<id>`
- `feature/<id>`
- `fix/<id>`
- `chore/<id>`
- `experiment/<id>` when the Controller explicitly authorizes an isolated comparison experiment

An explicitly authorized branch name takes precedence.

Do not implement directly on `main`. Do not force-push, rewrite shared history, reuse a branch for unrelated work, or bypass review.

`main` is the default PR target only when the current Workstream Contract explicitly names `main`. Stacked or experimental work may target another verified branch when the Controller authorizes it. Never infer or retarget a PR merely from convention.

## Commits and dependencies

Keep commits focused, coherent, and attributable to the authorized scope. Avoid unrelated formatting or cleanup.

Dependency additions, removals, upgrades, package-manager changes, and lockfile changes require explicit workstream authority. When dependency work is authorized, preserve reproducibility and record the exact resulting lockfile and validation evidence.

## Pull requests

PRs must remain bounded to one authorized workstream and use the exact authorized PR target. Record the workstream ID, exact base and head, changed paths, implementation summary, validation commands and exact results, CI evidence, limitations, unexpected findings, reviewer entry point, merge authority, and Stop Gate.

For stacked or experimental work, preserve the frozen parent baseline and do not overwrite, close, merge, or retarget the parent PR unless separately authorized.

## Validation and evidence

Run exactly the validation required by the workstream and report failures as failures. Evidence must identify the exact commit, PR, check, run, or artifact it proves. Do not substitute executor narrative for direct evidence.

Follow `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md` for executor-route selection, binary-asset ingestion, no-manual-transfer, low-bandwidth Desktop execution, GitHub Actions evidence, and Skills/instruction-layer boundaries.

Never commit secrets, credentials, unrestricted private data, generated dependency caches, transient logs, or fabricated product/commercial evidence.

## Review and merge

Executors may self-check their work but may not self-approve or merge it. Controller/owner review and the authority named by the current workstream determine acceptance and merge.

For major GS visual sections, a Controller visual pass is not owner visual acceptance. Explicit owner visual acceptance is required before integration into the accepted visual baseline unless a later governed owner decision changes that policy.

Stop when the required PR and handoff are review-ready or when the workstream Stop Gate is reached. Do not continue into the next workstream without explicit authorization.
