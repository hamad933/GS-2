# Executor Routing, Binary Assets, and Remote Evidence

## Purpose

This document defines stable repository execution rules for choosing an executor route, handling production binary assets, minimizing manual transfer, and producing reviewable evidence for `hamad933/GS-2`.

It does not authorize a workstream by itself. The current governed GS control state and exact bounded Workstream Contract remain higher authority.

## Executor-route selection

Choose the execution environment by the needs of the bounded task, not by habit.

### Normal ChatGPT executor chat

Use when fresh visual reasoning, reference comparison, composition judgment, RTL craft, or cross-source diagnosis is materially important and the chat has the required native tools.

Before editing, the executor must verify in its own chat that it can directly:

- inspect the exact GitHub repository state;
- create or use the authorized branch;
- read and update the authorized UTF-8 source files;
- create commits and publish the authorized PR or branch state;
- inspect the required Google Drive visual references;
- inspect GitHub Actions runs and artifacts required by the workstream.

If repository write support is unavailable, stop with:

`NORMAL_CHATGPT_EXECUTOR_WRITE_ROUTE_UNAVAILABLE`

Do not substitute routine owner-mediated patch, ZIP, screenshot, or binary transfer.

### Codex Desktop

Prefer a low-bandwidth hybrid workflow:

`local source edit -> small commit/push -> GitHub Actions heavy validation/evidence -> Controller remote review`

Default local checks should be cheap: `git status`, `git diff`, `git diff --check`, and lightweight static checks that require no major download.

Do not automatically run repeated `npm ci`, browser downloads, Chromium/Playwright installation, screenshot production, artifact downloads, or other bandwidth-heavy steps. Use existing local dependencies only when already available and useful. A local debugging blocker may justify a bounded exception.

Do not upgrade dependencies without explicit workstream authority.

### Codex Cloud

Use selectively for logic, refactors, tests, workflows, repository governance, and bounded text/source work. For major visual work, it is not the default until its output demonstrates the required visual fidelity.

Before a visual Codex Cloud task:

- required runtime assets must already exist at a canonical repository path or enter through a separately verified native ingestion route;
- do not depend on uploaded attachment order or normalized attachment filenames;
- do not use source-byte SHA-256 as an identity gate after a transport layer unless byte preservation was directly verified;
- make the exact starting commit and authorized PR target explicit;
- treat sandbox-local branch names or missing remotes as execution-environment details when the exact selected commit is verified;
- keep heavy validation and visual evidence in GitHub Actions;
- stop before merge.

### ChatGPT Work

Use only when the current product capabilities offer a concrete advantage for the bounded task, such as persistent multi-step work or artifact coordination. It is not the default coding executor merely because it is available.

## Binary-asset authority and ingestion

### Authority split

- Owner source masters and Integrated Targets remain in governed visual/reference storage unless a governed decision promotes a derivative into runtime use.
- Runtime production assets should enter their canonical repository location once and then be referenced by executors.
- Repeated task-by-task image upload is not a valid canonical asset pipeline.

### Preferred native binary bridge

When the connected GitHub execution surface supports binary blob creation, use a one-time bounded asset-ingestion workstream:

1. read the governed source asset directly;
2. verify the intended file, dimensions, format, and visual identity;
3. create the binary Git blob through a byte-preserving native GitHub route;
4. place the blob at the authorized canonical runtime path through a bounded branch/commit/PR;
5. record source/derivative provenance and repository identity;
6. after acceptance, executors reference the repository path and do not re-upload the asset.

The Controller must verify the exact supported tool route before each new ingestion mechanism is relied upon.

### Transport normalization

If a platform transcodes, renames, or reorders image attachments:

- do not trust attachment order;
- do not trust normalized filenames as source identity;
- do not require the original source-byte hash to survive;
- compare decoded visual identity, dimensions, expected role, and direct visual inspection;
- retain the canonical source hash separately at its authority source when useful.

### Base64 and encoded-text fallback

Large application-bundle Base64 data URLs are not the preferred permanent runtime architecture. Existing `heroCleanData.ts -> data:image/webp;base64` behavior in PR `#13` is a bounded workaround and does not establish a general policy.

If native binary publication becomes unavailable, a separately reviewed fallback may use a canonical text-safe representation plus verified build-time decoding to a real asset file. Such a fallback requires explicit review of caching, LCP/performance, repository clarity, CI behavior, security, and developer workflow before adoption.

## No-manual-transfer default

The owner should not routinely move technical material between tools or chats.

Prefer:

- direct Google Drive reference inspection;
- direct GitHub repository operations;
- GitHub Actions for builds and browser execution;
- GitHub Actions artifacts for screenshots/evidence;
- Controller retrieval of evidence directly from GitHub.

Routine owner-mediated downloading/uploading of patches, ZIPs, binary assets, screenshots, logs, or evidence is prohibited when a native route exists.

Manual transfer is exceptional and requires either a verified native-route limitation or evidence that only the owner can supply.

## GitHub Actions evidence model

For source implementation PRs, automation should normally provide:

- exact-head checkout and verification;
- dependency installation in the remote runner;
- lint;
- typecheck;
- build;
- `git diff --check` or equivalent diff-integrity validation where applicable;
- deterministic browser execution when visual evidence is required;
- required screenshot-name verification;
- artifact name tied to exact head SHA.

Visual work should prefer Chromium, one worker, deterministic viewports, and exact-head evidence.

Heavy technical/visual evidence remains `REFERENCE_ONLY` by default. The Controller retrieves and inspects it directly. Do not automate merge.

## Skills and instruction layers

Keep these distinct:

1. **Installed/active product Skill or plugin** — product capability whose availability must be directly verified in the chosen execution environment.
2. **Repository-local `SKILL.md`** — versioned procedural guidance in GitHub; its existence does not prove product installation or automatic activation.
3. **`AGENTS.md` and repository governance** — repository-stable execution truth.
4. **Workstream Contract** — exact task context, scope, exclusions, evidence, and Stop Gate.

Never claim an installed or active Skill merely because a `SKILL.md` file exists.

Use the minimum complete set of high-value skills/instructions. Generic design guidance never outranks GS visual authority and must not introduce generic SaaS cards, broad glassmorphism, neon/purple tropes, or unrelated style systems.

## Major GS visual acceptance boundary

Technical checks and Controller visual review are necessary evidence, not owner acceptance.

For a major GS visual section, integration into the accepted visual baseline requires explicit owner visual acceptance unless a later governed owner decision changes this rule.

A Controller may issue `CONTROLLER VISUAL PASS`, but must not translate that verdict into `OWNER VISUAL ACCEPTANCE`.

## Stop rule

Executors do not merge, update canonical Drive state, start the next workstream, or change executor strategy beyond the exact Workstream Contract.