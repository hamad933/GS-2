# Execution and Safety

## Scope control

Verify the exact repository, base commit, branch, PR target, authorized paths, validation requirements, and Stop Gate before editing. Modify only what the bounded Workstream Contract authorizes. Prefer reversible, reviewable changes and stop when a new product, architecture, visual, deployment, destructive, or external decision would be required.

GS is a reference-product and solution-selection website. `RP01`–`RP04` remain separate products and must not be copied into this repository as full implementations or canonical product truth.

## Secrets, privacy, and evidence claims

Never commit passwords, tokens, API keys, private keys, connection strings, session material, unrestricted personal/client data, or other sensitive credentials. Use safe placeholders and approved secret-management mechanisms when a future workstream authorizes integrations.

Never fabricate or imply unsupported clients, customer logos, testimonials, metrics, performance numbers, uptime, latency, prices, delivery times, guarantees, integrations, production security, or operational evidence. Demo or illustrative material must be unmistakably labeled as such.

## Dependencies and architecture

The repository already has an inherited React/Vite frontend baseline. Do not change framework, runtime, package manager, dependencies, data architecture, backend, hosting, CI, or deployment unless the current bounded workstream explicitly places that change in scope. When dependency work is authorized, preserve reproducibility and review necessity, security, licensing, maintenance, and lockfile impact.

## Executor route, assets, and evidence

Follow `docs/governance/EXECUTOR_ROUTING_ASSETS_AND_EVIDENCE.md` when choosing or operating a normal ChatGPT executor, Codex Desktop, Codex Cloud, or ChatGPT Work route; when ingesting binary production assets; or when producing GitHub Actions evidence.

Production binary assets should enter an authorized canonical repository location once through a verified native ingestion route and then be referenced by executors. Do not repeatedly route canonical assets through chat attachment pipelines when those pipelines may transcode, rename, or reorder files.

Routine owner-mediated patch, ZIP, binary, screenshot, log, or evidence transfer is not the default when direct Drive/GitHub/Actions routes exist.

## Execution discipline

- use the exact authorized branch and PR target named by the Workstream Contract;
- do not infer that every PR targets `main`;
- do not force-push or rewrite shared history;
- keep edits focused and avoid unrelated cleanup;
- preserve UTF-8 Arabic text and explicit RTL/LTR semantics where applicable;
- tie evidence to the exact reviewed commit, PR, check, run, or artifact;
- do not alter evidence to hide failures;
- do not write to Google Drive as an executor;
- do not self-approve, merge, deploy, publish, release, or begin the next workstream without authority.

For major GS visual sections, technical success and Controller visual review do not constitute owner visual acceptance. Explicit owner visual acceptance is required before integration into the accepted visual baseline unless a later governed owner decision changes that policy.

If credentials, sensitive data, unsupported claims, an authority conflict, or an unavailable required execution route is discovered, stop and report the exact issue without spreading sensitive material.
