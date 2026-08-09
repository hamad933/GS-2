# Evidence and Execution Handoff

## Evidence principle

An execution claim is valid only when it is traceable to the exact reviewed repository state. Prefer direct GitHub evidence over duplicated narrative: commit/PR diff for changes, checks/runs for validation, and artifacts only when they add necessary diagnostic or acceptance evidence.

## Evidence classification

Classify evidence as one of:

- `REFERENCE_ONLY` — keep at its authoritative technical location; this is the default.
- `PROMOTE_TO_DRIVE` — eligible for long-term governance preservation only after Controller review and an authorized Drive update.
- `DO_NOT_PRESERVE` — transient, redundant, or diagnostic material with no continuing review, audit, recovery, or acceptance value.

Executors do not write evidence to Google Drive.

## Integrity requirements

- tie evidence to the exact base, head commit, PR, check, workflow run, or artifact it proves;
- record failed checks honestly and do not edit logs, screenshots, or reports to imply success;
- distinguish reference/demo/simulated material from real implementation or operational evidence;
- keep secrets and sensitive data out of evidence and logs;
- state unavailable or uninspected evidence explicitly.

## Required execution handoff

Every bounded workstream handoff must include, as applicable:

```text
Project / Workstream
Authorized contract and verified base
Repository / base branch / working branch
Exact base commit
Exact head commit
PR number / URL
Changed paths
Implementation or governance summary
Source-code corrections made only for validation
Validation commands and exact results
GitHub Actions run/check references
Known limitations and deviations
Unexpected findings
Evidence classification and locations
Reviewer entry point
Merge authority
Stop state / Stop Gate
```

Do not paste complete source files or full CI logs into the handoff when direct GitHub references exist.

## Acceptance boundary

A green check, an executor statement, or an open PR is evidence, not acceptance. Executors do not self-approve. Controller/owner authority named by the workstream determines acceptance, merge, release, publication, deployment, and any later promotion of evidence to Drive.
