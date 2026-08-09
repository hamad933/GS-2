# GS-2 Technical Baseline

## Current verified baseline

GS-2 inherits an existing frontend implementation. This document records that implementation; it does not redesign or expand the architecture.

The repository currently declares these core packages in `package.json`:

- React `^18.3.1`
- Vite `^5.2.0`
- TypeScript `^5.5.4`
- Tailwind CSS `3.4.17`
- Framer Motion `^11.5.4`

The application is a Vite-powered React/TypeScript frontend with Tailwind styling. The current entry path is `index.html` → `src/index.tsx` → `src/App.tsx` → the existing page/component tree.

This is the inherited current implementation baseline. It is not a new stack selection made by governance work.

## Change boundary

Future framework, runtime, package-manager, dependency, backend, data, integration, hosting, deployment, or CI architecture changes require a bounded authorized workstream with explicit validation and review.

No new database, backend service, hosting platform, deployment target, authentication system, analytics architecture, or production integration is selected by this baseline.

`RP01`, `RP02`, `RP03`, and `RP04` remain external independent products. Their applications and canonical product truth are not part of the GS-2 architecture.

## Decision records

Do not create ceremonial ADRs. Add a focused decision record only when a future authorized workstream makes a durable architectural decision that genuinely needs one.
