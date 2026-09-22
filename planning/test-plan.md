# Executable test plan

## Project commands to implement in Flow 06

- `npm run content:dev` — strict structure and relation validation; drafts may retain stage-appropriate empty fields.
- `npm run content:media` — adds file, dimensions, hash uniqueness, ledger adoption, three-capture, and video checks.
- `npm run content:prepublish` — validates the intended batch except first publication dates/state switch.
- `npm run content:release` — read-only full published-data, TDK, media, risk, fingerprint, CSP, and route checks.
- `npm run content:update` — explicitly updates only stale fingerprints and affected dates; never runs implicitly in CI/build.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint.
- `npm test` — Node unit/integration tests using the same validator modules.
- `npm run build` — release validator followed by Next static export and host-file emission.
- `npm run preview` — local static server for `out/` with slashless HTML fallback and security headers.
- `npm run test:e2e` — Playwright against the local production preview using installed Chrome.
- `npm run audit:output` — inspect every exported HTML route, links, canonical, metadata, JSON-LD, visible text, image files, CSP, and sitemap.
- `npm run check` — typecheck, lint, unit/integration tests, build, output audit, and browser tests.

## Data and identity tests

1. Strictly reject unknown/extra Game, Guide, player, SEO, content-section, or block fields; reject non-JSON syntax.
2. Reject duplicate IDs/slugs across the main game, additions, and Guides; verify Guide filename equals slug.
3. Assert main game is not in additions and only canonical `/` exists for it.
4. Assert at least eight published additions, Featured 6–8, New 6–8, Recommended exactly six, and each detail can resolve six non-self related games.
5. Resolve each stable ID through list card, href, detail H1, description, waiting cover/currentSrc, iframe source, article, SEO, JSON-LD, and sitemap. Any cross-game or fallback value fails.
6. Verify every published cover path and hash is unique; declared dimensions equal decoded image dimensions.
7. Verify every game has at least 4,000 visible non-whitespace article characters excluding captions, video copy, recommendation/card text, and shared shell. Run cross-game paragraph similarity diagnostics and manually review flagged duplication.
8. Verify every planned Guide exists, is complete, and all public Guide consumers use its one JSON object.

## SEO, URL, and state tests

1. Assert the primary navigation is exactly Home, Guides, More Games with approved paths/order and one array identity shared by desktop, mobile, and Footer.
2. Assert five Legal links are root paths, current-tab links, and include the required `rel`; no `/legal/` output exists.
3. Count final HTML titles/descriptions by Unicode code point and assert 40–60/140–160, uniqueness, required game names, canonical equality, and shared social image.
4. Parse JSON-LD and compare names, URLs, media, FAQ, and dates to visible/data values.
5. Parse sitemap XML; compare canonical sets against registry + published stable IDs and confirm `/` occurs once.
6. Recalculate content fingerprints in read-only mode. Unchanged records preserve dates byte-for-byte; deliberately changed fixtures fail until update mode.
7. Compare production CSP `frame-src` in final HTML and `_headers` to the unique safely parsed published Game origins. Production must not include `'unsafe-eval'` or draft origins.

## Component/browser tests

1. At each of nine game routes, initial state has one visible enabled focusable `Play Now` over the current cover and zero game iframes.
2. A safe click or Enter activation creates exactly one iframe with `src` equal to current Game JSON; rapid repeated activation never creates a second. Unsafe-main fixture creates zero and shows failure/retry.
3. Trigger timeout and retry with deterministic test timing; confirm old iframe/timer cleanup, readable live status, and one new attempt.
4. Enter/exit Webpage and Browser Fullscreen independently, test denied request and Esc, verify mutual exclusion/focus restoration. Compare normalized SVG path data and screenshots to ensure geometric distinction.
5. Desktop 1536: computed container 1400px, 380px rail, 28px gap; recommendation three columns; rail groups two columns and 6–8 each.
6. 1024: hamburger active, game page remains 648/320 two-column with 16px gap; More Games four columns; Guide rows left/right; no horizontal overflow.
7. 768 and 390: sticky removed; order player, six Recommended, article, videos, Featured, New; games two columns; Guide rows stacked.
8. Scroll tall pages down and back up at desktop and 1024. Record rail top/bottom and parent/Footer bounds; all cards must be reachable, no internal rail scrollbar exists, Header/Footer are never covered.
9. Tab through skip link, navigation/menu, Play, fullscreen, cards, videos, and Footer; verify ≥44px targets, focus visibility, menu Escape/return, one H1, and no inaccessible color-only state.
10. Capture console, page errors, failed same-origin JS/CSS/API requests, and CSP violations on every required production route; any framework overlay, hydration error, uncaught exception, critical request failure, or unexpected CSP refusal fails.

## Real game and media acceptance

Automated iframe `load` is never the final pass. In a clean browser at the production preview, each additional game must display the expected title/art, reach a real interaction surface, accept one effective pointer/keyboard/touch action, and record final frame URL and critical network errors. Krillion receives the same attempt; if input cannot be proven, it stays `provisional`, while iframe count/src or safe-rejection behavior plus timeout/failure/retry still must pass.

Every game is checked against its adopted cover, three distinct captures, 1–3 exact YouTube videos, local video poster, and adjacent copy. Video embed availability and actual visible game/version are checked manually in browser; unavailable videos force replacement (or game replacement for an addition).
