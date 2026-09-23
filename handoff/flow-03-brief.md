# Flow 03 handoff — page and content structure

Status: **complete**

## Locked decisions

- Site name and short name are `Krillion`; canonical origin is `https://krilliongames.com` and trailing slashes are disabled.
- Shared navigation is exactly Home `/`, Guides `/guides`, More Games `/games`. Research did not support an independent topic page, so no thin navigation destination was added.
- The homepage is the only main-game detail and canonical. No `/games/krillion` route may exist.
- Eight additional game details and three Guide details are planned. Five Legal/site pages use their required root paths.
- Every game page has an independent article plan with a hard minimum of 4,000 visible non-whitespace characters after the player, plus an exact cover, three explanatory screenshot slots, and a current-game video slot.
- The shared game layout, 1400px maximum container, 1024/768-only breakpoints, height-aware rail behavior, mobile sequence, 6/4/2 games grid, and responsive Guide rows are locked in `site-structure.md` and `content-map.json`.
- Every planned additional game has six explicitly justified related games. Homepage Featured/New/Recommended counts remain 8/8/6 from `game-coverage.json`.

## Outputs

- `planning/site-structure.md`
- `planning/content-map.json`
- `planning/internal-link-map.json`
- `planning/guide-coverage.json`
- `planning/game-coverage.json`
- `planning/redirect-map.json`

## Next-stage requirements

- Flow 04 must turn every stable media slot into a complete `planning/media-slots.json` record without choosing unverified media.
- Visual design must preserve the exact breakpoint and rail constraints and must not invent a narrow article column.
- The main iframe is still `provisional`; this does not block design or build work.
- All additional games still require final real-input verification before publication, and every game including Krillion still requires a verified embeddable YouTube video.
