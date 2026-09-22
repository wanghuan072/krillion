# Flow 10 — Production Acceptance Report

Status: `completed_with_warnings`  
Acceptance date: 2026-09-21  
Production origin configured in output: `https://testkrillion.com`  
Deployment performed: no

## Release inventory

- Static Next.js export: `out/` (186 files, approximately 6.15 MB at the final audit point).
- Indexable sitemap routes: 19.
- Games: 1 main game on `/` plus 8 published additional games.
- Guides: `/guides` plus 3 published detail pages.
- Legal pages: `/privacy`, `/terms`, `/copyright`, `/about`, and `/contact`.
- Home groups: 8 Featured, 8 New, and exactly 6 Recommended games.
- Every game has its own cover, three registered live-game captures, one verified YouTube embed, independent player data, and independent long-form copy.
- Every published game article exceeds 4,000 non-whitespace visible characters; the measured range is 5,223–7,552.

## Automated release gates

All of the following passed against the production data and static output:

- `npm run content:release`: 9 games and 3 Guides accepted.
- `npm run typecheck`.
- `npm run lint`.
- `npm test`: 4/4 data and identity tests passed.
- `npm run build`: 24 static/SSG pages generated successfully with Next.js 16.3.5.
- `npm run audit:output`: static output audit passed.
- `node scripts/audit-seo-output.mjs`: 19/19 indexable pages passed.
- `npm run test:e2e`: 6/6 production-browser scenarios passed.
- Production preview resource audit: no site-origin 4xx/5xx responses, uncaught exceptions, hydration errors, or framework error overlays.
- Sitemap SHA-256 remained `76EA9F0442964DA8C66506241029B88F6877D32EA3334FAAE02D11550A5019F3` across unchanged builds. Visible-content fingerprints are stored in `seo/page-lastmod.json`; the final Word Detector media-copy change updated only its fingerprint while retaining the same date.

## Browser and responsive acceptance

- Tested game pages at 1464×900, 1024×900, and 768×900; all player, Recommended, article, and video regions share the complete left-column width.
- The main container measured 1400 px at 1464 px, 984 px at 1024 px, and 736 px at 768 px.
- More Games rendered 6, 4, and 2 columns at the required viewports.
- At 1464×900, the tall rail ended at 884 px while scrolling down and returned to 93 px below the viewport top while scrolling up.
- At 1024×600, the tall rail ended at 584 px while scrolling down and returned to 85 px while scrolling up.
- At 768 px, the rail computed to `position: static` and followed the required Recommended → article → video → Featured → New order.
- No rail-internal scrollbar is used.
- The mobile menu, Escape dismissal, keyboard-focusable Play Now control, and visually distinct webpage/browser fullscreen SVGs passed E2E checks.

Evidence: `reports/acceptance-browser-results.json`, `reports/sticky-rail-results.json`, and `reports/acceptance-screens/`.

## Player runtime acceptance

All nine routes began with zero game iframes and created exactly one iframe only after Play Now. The eight additional games reached separate Famobi instances with the expected per-game title and a visible change after input. The required redirect origin is derived from each validated `fg_domain` value and emitted into production CSP. Production CSP contains no `unsafe-eval`.

The main game preserves the supplied URL exactly: `https://www.krillion.org/play/daily/`. It created one iframe, loaded a page titled `Krillion — Play`, and responded visually to input in the acceptance run. Its release status remains `provisional`, not verified playable, because the supplied first-version address was not validated through complete gameplay.

Evidence: `reports/player-runtime-results.json` and `reports/runtime-screens/`.

## Issues found and resolved during acceptance

1. Famobi redirected from `games.cdn.famobi.com` to `play.famobi.com`; production CSP initially blocked that destination. CSP generation now derives and includes the validated redirect origin from Game JSON.
2. Windows static export emitted nested RSC payload paths while the client requested dotted aliases. The host-output step now emits 19 portable aliases; the production preview prefetch audit returns zero 404 responses.
3. Word Detector media slots were replaced with three distinct live launch states and matching public captions: title control, provider launch layer, and consent step.
4. All game iframes now use a least-privilege sandbox that keeps scripts, same-origin storage, forms, pointer lock, orientation lock, and modals available while withholding popup and top-navigation permissions. All nine player routes were rerun successfully after this hardening.
5. The original Famobi `A1000-11` URLs were launch wrappers whose internal Play control required `window.open`. Every additional game now uses Famobi's official inline embed form, `https://play.famobi.com/<slug>/A-FAMOBI-COM`; the eight routes were retested without popups, sandbox violations, or player errors.

## Release warning

The deployable output is accepted, but the main Krillion iframe remains `provisional`. A later replacement requires changing only `data/games/main-game.json` → `player.iframeSrc`, refreshing the content fingerprint, rebuilding, and rerunning the affected CSP/player checks. No deployment or Git commit was performed.
