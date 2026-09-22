# Component plan

## Shared shell

- `SiteHeader` reads one navigation array for desktop and `MobileMenu`. It renders `/images/logo.png` at its real 240×64 intrinsic size, visually constrained to 150×40. The sticky Header publishes its measured height as `--header-height`.
- `MobileMenu` is used only at 1024px and below, traps no focus unnecessarily, closes through its button, link selection, and Escape, and returns focus to its trigger.
- `SiteFooter` reads the same primary navigation and a Legal configuration. Every Legal link has the required `rel`; email on Contact remains plain text.
- `SkipLink`, `PageContainer`, `SectionHeading`, `DepthDivider`, and `Figure` establish shared behavior without duplicating breakpoint-only classes.

## Game data components

- `GamePageShell` receives one complete Game object and route mode (`home` or `detail`). It refuses to render missing title, slug, short description, cover, player URL, article, screenshots, videos, or SEO data.
- `GamePlayer` owns the finite states `unconfigured`, `waiting`, `loading`, `loaded`, `timeout`, and `failed`. `Play Now` is a real button over the current cover. A monotonic attempt ID prevents duplicate iframes; retry removes the prior frame before a new attempt. Unsafe main URLs fail before frame creation.
- `PlayerStatusBar` renders current game title, live state text, `WebpageFullscreenButton`, and `BrowserFullscreenButton`. The first SVG contains a rectangle plus two arrow paths; the second contains four corner paths. Path data and silhouettes are intentionally different.
- `GameRecommendationGroup` receives a heading, array of Game IDs, current ID, count bounds, and presentation (`recommended` or `rail`). It resolves every ID from the published Game dataset and throws on missing or duplicate data.
- `GameCard` binds image, title, href, and auxiliary text from one Game object. No fallback cover exists. Recommended uses three columns wide/two tablet and mobile; rail always uses two.
- `GameArticle` renders game-specific structured sections at the full left-track width. Supported blocks are paragraph, heading, list, tip, caution, steps, figure, and FAQ. It does not use a prose max-width.
- `GameVideoSection` follows the complete article and renders 1–3 exact embeddable videos with local posters and consent-aware lazy iframe creation.
- `HeightAwareRail` uses native sticky when shorter than the viewport. When taller, a small controller tracks scroll direction and toggles top/bottom anchoring within the grid parent. It never creates an internal scroll area or fixed element and is disabled at 768px.

## Lists and Guides

- `GamesGrid` filters only published additional games and asserts a minimum of eight. CSS uses the shared card class with six/four/two columns at the two allowed breakpoints.
- `GuidesList` derives rows from published Guide JSON, image-left at wide and tablet, stacked at mobile.
- `GuidePage` renders cover, summary, verified update date, structured content, related Guides, and a list-back link. `GuideArticle` alone uses a 72ch reading measure.

## Player state copy

| State | Visible wording |
| --- | --- |
| Unconfigured | “This game is not ready to start here.” |
| Waiting | `Play Now` plus the game's exact control hint. |
| Loading | “Loading [game title]…” |
| Loaded | “Game loaded. Click inside the game if controls need focus.” |
| Timeout | “The game took too long to respond. You can retry safely.” |
| Failed | “The game could not be opened safely here.” plus `Retry`. |
| Fullscreen failure | “Fullscreen was not available. Keep playing in the page.” |

Statuses use `role=status` or `role=alert` as appropriate without exposing iframe policy, file names, CSP, or configuration.

## Accessibility and performance

- All interactive controls are at least 44×44px; card links have visible `:focus-visible` rings and meaningful accessible names.
- Images include intrinsic dimensions and responsive `sizes`. Only the first visible cover is priority-loaded; article figures and video posters are lazy.
- Iframes use exact per-game allow and sandbox values from Game data. Video iframes are not created until requested.
- Heading levels remain sequential and each route has one H1. Sticky heading anchors use `scroll-margin-top: calc(var(--header-height) + 16px)`.
- `prefers-reduced-motion` removes line travel, lifts, and smooth scrolling. Forced-colors mode preserves control boundaries.
