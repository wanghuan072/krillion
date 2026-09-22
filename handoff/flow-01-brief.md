# Flow 01 Brief

## Status

`completed`

## Confirmed Inputs

- Workflow: `D:/wh/Agent/Game-Agent`
- Project: `D:/wh/202609/Krillion/Krillion/krillion`
- Keyword: `krillion`
- Main iframe first version: `https://www.krillion.org/play/daily/` (stored verbatim; provisional)
- Domain: `testkrillion.com`, normalized Origin `https://testkrillion.com`

## Outputs

- Created `project.yaml` with execution boundaries and detected runtime.
- Created `data/games/main-game.json` as the single main-game object.
- Created `data/games/games.json` as an empty additional-game array.
- Extended the existing framework-generated `AGENTS.md` with project constraints.
- Confirmed management paths for `research/`, `planning/`, `reports/`, and `handoff/`.

## Locked Decisions

- The project is an existing, undeveloped Next.js 16.3.5 App Router starter using npm.
- The main game is represented only by `/` and `data/games/main-game.json`.
- Additional games will be represented only by `/games/[slug]` and `data/games/games.json`.
- Canonical absolute URLs will use `https://testkrillion.com`.
- Network research, scoped code changes, necessary dependency installation, checks, and builds are enabled. Deployment and Git commits are disabled.

## Decisions The Next Flow May Change

- Display capitalization may be updated after name research without changing the stable ID, slug, or locked startup keyword punctuation.
- Language, target market, game runtime capabilities, player ratio, and research-backed topic-page count are unresolved.
- Deployment target and portable production output are deferred to Flow 05.

## Known Gaps

- The iframe has not been claimed as playable; its stage-01 status is `provisional` by rule.
- Cover, content, SEO, media, dates, and related games remain intentionally incomplete draft fields.
- There are no existing additional games or Guide records.
- The directory is not a Git repository, so there are no tracked user modifications to preserve. Existing starter files are nevertheless treated as user-owned.
- Existing public SVGs and create-next-app content are framework placeholders to replace only during implementation.

## Required Reads For The Next Flow

- Flow 02 instructions.
- Game JSON specification.
- Guide JSON specification before creating or checking Guide research data.
- Player interaction specification.
- Status and handoff specification.

## Next Flow Instructions

Research the exact Krillion entity and player intent, resolve language and market, preflight the provisional main iframe without treating failure as a blocker, investigate 12–20 additional-game candidates, determine Guide opportunities and whether any independent topic page is justified, and record per-game runtime/media/risk evidence without writing final public copy.
