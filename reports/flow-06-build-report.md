# Flow 06 build report

Status: **development implementation passed; production release gate intentionally failed on Flow 07–09 content/media/publication requirements**

## Runtime and output

- Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5.9.3.
- npm 11.17.0 on Node.js 24.19.0.
- Rendering: static generation with client islands for menu, player, videos, fullscreen, and tall-rail behavior.
- Production command: `npm run build`.
- Deployment artifact after the release gate passes: `out/`.
- Preview command after a successful build: `npm run preview` (default port 4173).

## Implemented routes

Public route wiring now exists for `/`, `/games`, `/games/[slug]`, `/guides`, `/guides/[slug]`, `/privacy`, `/terms`, `/copyright`, `/about`, `/contact`, `/robots.txt`, `/sitemap.xml`, and the 404 page. Draft-only development routes live below `/preview-internal/` and are scheduled for removal before the release build; they are disallowed in robots and return no generated dynamic params in production.

The main game has only `/`. No `/games/krillion` route exists.

## Data and components

- `main-game.json` preserves `https://www.krillion.org/play/daily/` exactly.
- `games.json` contains eight real draft candidates, each with stable identity, related IDs, homepage flags, and its current direct Famobi CDN launch URL. The initial `play.famobi.com/<slug>` discovery link was found to be an external launcher with `target="_blank"`; it was therefore replaced with the exact current-version frame URL reached by that provider link. A clean browser reached the actual game canvas for Guess Their Answer and an in-game launch click visibly changed the screen.
- One loader provides main/additional queries, route params, group selectors, and frame-origin derivation. One Guide loader provides collection, ID/slug, relations, and params.
- Three Guide JSON drafts match the planned stable IDs/slugs.
- Shared shell, responsive navigation, Footer Legal group, player state machine, unique fullscreen SVGs, game cards/groups, content renderer, video click-to-load component, Guide list/detail, and height-aware rail are implemented.
- CSP meta policy is derived from current data. Development alone permits `unsafe-eval` and WebSocket connections. Production policy does not. The deployable artifact additionally receives `_headers` with `frame-ancestors` because browsers ignore that directive in a meta policy.
- Logo and OG image were generated with the built-in image-generation mode and saved as `public/images/logo.png` (240×64 transparent) and `public/images/og-image.png` (1200×630). The prompt used the selected depth-line/K-aperture identity, exact `KRILLION` text, cyan/ink palette, and prohibited fake gameplay or official branding.

## Layout implementation

- One container class resolves to 1400px at wide viewports.
- Game base grid is `minmax(0,1fr) 380px` with a 28px gap; 1024px changes it to `minmax(0,1fr) 320px` with 16px gap; 768px switches to a single flow.
- `/games` computes 6/4/2 columns at wide/1024/768. Recommended computes 3 columns wide and 2 at the two smaller ranges. Rail groups stay two columns.
- Player, Recommended, article, figures, and videos share the same left track without a nested reading maximum. Guide detail alone uses a reading measure.
- The rail uses ResizeObserver plus native parent-constrained sticky. It switches top/bottom bias according to height and direction and is static at 768px, with no internal scrolling.

## Commands and results

| Command | Result |
| --- | --- |
| `npm run content:dev` | Passed: 9 games and 3 Guides; expected warnings for Flow 07 content and Flow 08 media. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed, 4 tests. |
| `TEST_BASE_URL=http://localhost:3002 npm run test:e2e` | Passed, 4 tests. Covers nine lazy players, exact iframe binding, 8/8/6 groups, 6/4/2 grid, and distinct SVG geometry. |
| `npm run build` | Exit 1, expected. The release validator rejected draft status, missing 4,000-character articles, media, TDK, and publication dates. No framework/configuration/type/build error was hidden behind that gate. |

The development preview was also inspected in the in-app browser. It displayed the correct Logo/navigation/footer, one visible Play Now control, zero initial iframe, and exactly one iframe after activation with the exact main JSON source. No page error, rejected Promise, or functional console error was recorded. A `127.0.0.1` HMR-origin warning during a separate headless attempt was avoided by using the server's canonical `localhost` URL; automated tests then passed cleanly.

## Remaining release work

- Flow 07: complete nine independent game articles, three full Guides, second-pass facts/risk records, exact SEO drafts, and verified video research.
- Flow 08: create/adopt nine unique covers, at least 27 explanatory game captures, Guide media, and local video posters; update media ledger and every slot.
- Flow 09: final TDK, statuses/dates, fingerprints, JSON-LD/sitemap synchronization, removal of draft preview routes, and release build.
- Flow 10: production-preview route/runtime/accessibility/sticky tests and real effective input for every additional game. The main game remains provisional unless a fresh in-site answer can be demonstrated.

No temporary service remains running. No deployment or Git commit was performed.
