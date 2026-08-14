# Execution and Safety

## Scope control

Verify the exact repository, authorized base commit, branch, PR target, authorized paths, validation requirements, evidence requirements, merge authority, and Stop Gate before editing. Modify only what the bounded Workstream Contract authorizes. Prefer reversible, reviewable changes and stop when a new product, architecture, visual, deployment, destructive, or external decision would be required.

The Workstream Contract controls the PR target for that workstream. Do not infer a universal `main` target. A stacked or intermediate target does not transfer mainline merge authority to the executor.

GS is a reference-product and solution-selection website. `RP01`–`RP04` remain separate products and must not be copied into this repository as full implementations or canonical product truth.

## Secrets, privacy, and evidence claims

Never commit passwords, tokens, API keys, private keys, connection strings, session material, unrestricted personal/client data, or other sensitive credentials. Use safe placeholders and approved secret-management mechanisms when a future workstream authorizes integrations.

Never fabricate or imply unsupported clients, customer logos, testimonials, metrics, performance numbers, uptime, latency, prices, delivery times, guarantees, integrations, production security, or operational evidence. Demo or illustrative material must be unmistakably labeled as such.

## Dependencies and architecture

The repository already has an inherited React/Vite frontend baseline. Do not change framework, runtime, package manager, dependencies, data architecture, backend, hosting, CI, or deployment unless the current bounded workstream explicitly places that change in scope. When dependency work is authorized, preserve reproducibility and review necessity, security, licensing, maintenance, and lockfile impact.

## Executor route, assets, and remote evidence

Use `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md` when executor capabilities, binary assets, GitHub Actions validation/evidence, artifact retrieval, or product/repository Skill distinctions are material.

Production binary assets should enter an authorized canonical repository location once through a verified byte-preserving native route and then be referenced by later executors. Repeated owner-mediated transfer of patches, ZIPs, binaries, screenshots, logs, or evidence is not the default when a direct governed GitHub/Actions route exists.

## Execution discipline

- use the exact authorized branch and PR target named by the Workstream Contract;
- verify the exact base before mutation and preserve exact-head traceability after mutation;
- do not infer that every PR targets `main`;
- do not force-push or rewrite shared history;
- keep edits focused and avoid unrelated cleanup;
- preserve UTF-8 Arabic text and explicit RTL/LTR semantics where applicable;
- tie evidence to the exact base, head commit, PR, check, workflow run, or artifact;
- do not alter evidence to hide failures;
- keep technical evidence `REFERENCE_ONLY` by default unless separately promoted under governed evidence authority;
- do not write to Google Drive as an executor;
- do not self-approve, merge, deploy, publish, release, or begin the next workstream without authority.

## Acceptance boundary

Technical success, green CI, screenshot evidence, or Controller review is not automatically owner acceptance. Where the owner retains an acceptance gate, only explicit owner acceptance satisfies it. The executor must not translate a Controller verdict into an owner verdict.

If credentials, sensitive data, unsupported claims, an authority conflict, an unavailable required execution route, or an unexpected baseline/head change is discovered, stop and report the exact issue without spreading sensitive material.
