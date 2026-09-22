# Flow 05 handoff — code structure and data model

Status: **complete**

## Locked implementation

- Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5.9.3, npm, Node 24.19.0.
- Build-time static generation with `output: "export"`; deployable output is `out/`.
- Dynamic Game and Guide routes use `generateStaticParams` and reject unknown params.
- Root Game and Guide JSON remain the only content facts. App routes stay thin; full pages, components, loaders, validation, SEO, and CSS receive separate `src/` responsibilities.
- Static-export CSP is derived from Game data, enforced portably with HTML meta policy, and emitted as `_headers` for compatible hosts. Production never permits `'unsafe-eval'`.
- `@playwright/test` will be added in Flow 06 and use the installed Chrome channel for repeatable route/layout/player audits.

## Outputs

- `planning/code-structure.md`
- `planning/data-flow.md`
- `planning/route-registry.json`
- `planning/test-plan.md`
- updated `project.yaml`

Flow 06 may now modify code and create draft Game/Guide data. It must first implement the one validation/data-loading path, then build the shell and shared game skeleton; no content or media fallback is permitted.
