# GS Two-Tier Control Candidate v1

Status: `AUTOMATION_MAINTENANCE_CANDIDATE / JULES API SHADOW INTEGRATION / NOT PRODUCTION AUTHORITY`

This isolated candidate implements the deterministic GS Fast Controller control plane. It does not authorize product writes, Jules task creation, merge, release, deploy, final acceptance, or modification of `main`/integration.

## Authority and secret boundary

- Parent Controller owns this bounded automation-maintenance candidate.
- The Jules API is a control/continuation channel only; API capability does not grant project authority.
- Repository source knows only the secret name `JULES_API_KEY`; the secret value is never committed, printed, serialized, uploaded, cached, or persisted.
- The GitHub Actions secret is injected only into the trusted push-only Jules shadow step.
- PR/fork/product-candidate code never receives the Jules credential.

## Jules API adapter

Provider-specific HTTP behavior is isolated in `.project-control/jules_client.py`.

The adapter supports normalized reads, session/activity pagination, exact session-state normalization, bounded read retries, fail-closed error classification, active-session `sendMessage`, bounded plan approval, and Parent-authorized-only session creation. Fast Controller policy does not permit create-session.

`.project-control/jules_existing_session.py` is only a compatibility facade and intentionally exposes no create-session method.

## Activation stages

1. `AUTH_PROBE` — authenticated read-only `GET /v1alpha/sessions`.
2. `RECONCILIATION_DRY_RUN` — enumerate and sanitize sessions; map control lanes without mutation.
3. `SHADOW_ROUTING` — calculate proposed actions and receipts only.
4. `CANARY` — one safe existing session, one non-authority continuation, only after Parent confirms exact mapping.
5. `BOUNDED_ACTIVE_MODE` — gradual expansion after direct evidence and the authorized activation gate.

Current candidate stops at Phase 3. Jules mutations remain disabled.

## Safety

- Fast Controller is fail-closed.
- Unknown provider state is escalated, never guessed.
- Historical Jules usage uncertainty freezes new-task creation.
- Writes are never blind-retried after ambiguous outcomes; authoritative Jules post-state must be inspected first.
- GitHub workflow concurrency serializes controller runs; mutation leases and operation receipts prevent same-operation duplication within the control engine.
- A reviewer that writes or opens a code-bearing PR remains `REVIEWER_MUTATION_DETECTED`.
- `PUSH != ACCEPTANCE != MERGE`; `UNKNOWN != PASS`.

## Validation

Run:

`python -m unittest discover -s .project-control/tests -v`

The suite contains the existing deterministic matrix plus Jules API authentication, retry/error, session reconciliation, waiting-state routing, Reviewer↔Writer routing, idempotency, lease/circuit-breaker, task-budget, secret-safety, untrusted-event, and protocol-drift cases.
