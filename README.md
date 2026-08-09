# GS — General Solutions

`hamad933/GS-2` is the current execution repository for the GS reference-product and solution-selection website.

## Current frontend stack

The inherited frontend uses React, Vite, TypeScript, Tailwind CSS, and Framer Motion. See `docs/architecture/README.md` for the verified technical baseline and change boundary.

## Local commands

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
```

`npm run dev` starts the Vite development server on the host/port configured by the repository.

## Repository governance

Start with `AGENTS.md`, then follow the authorized Workstream Contract and the minimum reading order defined there. Stable execution and evidence rules live under `docs/governance/`.

`RP01`, `RP02`, `RP03`, and `RP04` are separate independent products. Their applications and canonical product truth are not contained in GS-2.
