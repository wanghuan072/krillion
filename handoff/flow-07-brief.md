# Flow 07 Handoff

Status: complete  
Next: Flow 08 — media acquisition, verification, and placement

## Ready

- Nine independent game articles exceed 4,000 visible non-whitespace characters before video.
- Three complete Guide articles live in separate JSON files.
- Game and Guide detail metadata meets required length bounds.
- Player-task briefs, secondary research, and new evidence are recorded.
- Content validation, type checking, linting, and unit tests pass.

## Flow 08 requirements

1. Verify and register one cover plus at least three explanatory gameplay screenshots for every game.
2. Insert screenshots into different relevant article sections with accurate alt text and captions.
3. Verify 1–3 current-version YouTube videos per page, including embeddability, and place them only after the article.
4. Create distinct Guide covers and update every media dimension in JSON.
5. Complete real input checks for all eight additional game builds and retain internal screenshots as evidence.
6. Treat the lack of a qualifying Krillion video as a publication blocker; do not substitute unrelated footage.

## Locked facts

- Krillion iframe: `https://www.krillion.org/play/daily/` (exact, provisional).
- Eight additional games use their own direct versioned CDN address in `games.json`.
- Candidate YouTube IDs are listed in `research/secondary-research.md`; none is public until checked.
