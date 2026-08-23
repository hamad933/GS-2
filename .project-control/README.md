# GS Two-Tier Control Candidate v1

Status: `AUTOMATION_MAINTENANCE_CANDIDATE / NOT PRODUCTION AUTHORITY`

This isolated candidate implements the deterministic core of the GS Fast Controller. It does not authorize product writes, task creation, merge, release, deploy, final acceptance, or modification of `main`/integration.

## Boundaries

- Fast Controller is fail-closed.
- It never creates a Jules task/session.
- It normalizes workstream, Jules, CI, review, and waiting-input states.
- It emits deterministic receipts and Parent recommendations.
- Unknown provider state is escalated, never guessed.
- Historical Jules usage uncertainty freezes new-task creation.
- A reviewer that writes or opens a code-bearing PR is `REVIEWER_MUTATION_DETECTED`.
- `PUSH != ACCEPTANCE != MERGE`; `UNKNOWN != PASS`.

## Current activation boundary

The candidate workflow is safe test/dry-run only. A ~10-minute fallback and live Jules continuation require a production execution channel plus direct Jules API credential/connector binding. Neither is granted by this branch. Scheduled GitHub workflows become authoritative only after an explicitly reviewed integration to the default branch; that integration is not authorized here.

## Validation

Run:

`python -m unittest discover -s .project-control/tests -v`

The matrix includes the 36 mandatory scenarios plus project-specific GS cases discovered during reconstruction.
