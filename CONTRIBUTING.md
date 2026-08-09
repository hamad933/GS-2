# Contributing to GS-2

## Workstream branches

Every change after the verified baseline uses an authorized, workstream-scoped branch and a pull request to `main`. Recommended patterns are:

- `governance/<id>`
- `feature/<id>`
- `fix/<id>`
- `chore/<id>`

An explicitly authorized branch name takes precedence; for `GS-GOV-REBASE-001` the branch is `codex/gs-gov-rebase-001`.

Do not implement directly on `main`. Do not force-push, rewrite shared history, reuse a branch for unrelated work, or bypass review.

## Commits and dependencies

Keep commits focused, coherent, and attributable to the authorized scope. Avoid unrelated formatting or cleanup.

Dependency additions, removals, upgrades, package-manager changes, and lockfile changes require explicit workstream authority. When dependency work is authorized, preserve reproducibility and record the exact resulting lockfile and validation evidence.

## Pull requests

PRs target `main` and must remain bounded to one authorized workstream. Record the workstream ID, exact base and head, changed paths, implementation summary, validation commands and exact results, CI evidence, limitations, unexpected findings, reviewer entry point, merge authority, and Stop Gate.

## Validation and evidence

Run exactly the validation required by the workstream and report failures as failures. Evidence must identify the exact commit, PR, check, run, or artifact it proves. Do not substitute executor narrative for direct evidence.

Never commit secrets, credentials, unrestricted private data, generated dependency caches, transient logs, or fabricated product/commercial evidence.

## Review and merge

Executors may self-check their work but may not self-approve or merge it. Controller/owner review and the authority named by the current workstream determine acceptance and merge.

Stop when the required PR and handoff are review-ready or when the workstream Stop Gate is reached. Do not continue into the next workstream without explicit authorization.
