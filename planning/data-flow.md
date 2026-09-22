# Data flow and single-source rules

## Site and navigation

`project.yaml.domain.origin` is parsed during build and exported by `src/config/site.ts` together with the locked identity from `planning/content-map.json`. Contact email is computed as `wyong@${hostnameWithoutWww}`. Logo and social paths are constants `/images/logo.png` and `/images/og-image.png`. `navigation.ts` reads the three approved primary items from the content map and asserts labels/order; Header, mobile menu, and Footer receive that same array. Legal navigation is a separate five-item constant with root paths.

`url-policy.ts` normalizes internal paths without trailing slash, rejects third-party values for site links, and combines paths with the one canonical HTTPS origin. Canonical, Open Graph URL, JSON-LD, breadcrumbs, sitemap, cards, and internal links call this module.

## Games

```text
project.yaml → main-game.json ┐
games.json -------------------┴→ strict validator → game-loader
  → home / games list / detail params / cards / player / article
  → metadata / JSON-LD / sitemap / content fingerprint
  → exact safe origin set → production CSP
```

The launch iframe string remains only at `data/games/main-game.json.player.iframeSrc`. Additional addresses occur only in their own Game object. Components never contain URL literals. The main value is parsed at runtime immediately before frame creation: a safe HTTPS URL creates exactly one iframe; an unsafe/unparseable value creates none and enters the visible failure/retry state. Changing the main URL therefore requires only that JSON field followed by content validation, fingerprint update if visible behavior changes, CSP audit, build, and player tests.

`getMainGame`, `getAllPublishedGames`, `getGameBySlug`, `getGameById`, `getHomepageSections`, `getSidebarSections`, `getRecommendedGames`, `getGameRouteParams`, and `getPublishedGameFrameOrigins` are the only public game queries. Production queries reject draft main data and filter all draft additions. A development-only test harness accepts an explicit validated draft collection but is not routed or exported.

Homepage groups use flags exactly: Featured 6–8, New 6–8, Recommended exactly 6. Detail selectors exclude current, take actual `relatedGameIds` for six recommendations, then compute Featured/New with stable ordering and minimal cross-group overlap. Every card resolves by stable ID and passes one whole Game object to image/title/link/player consumers; there is no fallback object.

Player field mapping is direct: image supplies waiting cover/alt/size; `iframeSrc` supplies `src`; `aspectRatio` and `orientation` supply geometry; permissions join into `allow`; non-null referrer and sandbox values map to the corresponding iframe attributes; timeout controls the state timer. The first migration removes no verified facts and rejects any legacy `flags.featured` after mapping it once to `isFeaturedHome`.

## Guides

Each `data/guides/<slug>.json` is validated against the current Guide schema, including filename equality and unknown-field rejection. `guide-loader.ts` alone scans, sorts, filters publication state, resolves relations, and returns route parameters. The list, detail, metadata, JSON-LD, related cards, and sitemap consume the same object. Content renderers use explicit block switches and throw on unknown blocks; neither HTML nor Markdown strings are interpreted.

## TDK and structured data

`seo/tdk.js` contains normal static-page entries and imports `main-game.json` to export home SEO without copying its strings. Additional details read `game.seo`; Guide details read `guide.seo`. `src/seo/metadata.ts` adds the shared 1200×630 social image, canonical, locale, and page-appropriate Open Graph type. It validates the final rendered title/description after any composition: 40–60 and 140–160 Unicode code points.

Game pages emit `VideoGame` plus breadcrumb data that matches visible content. Guide details emit `Article`/`HowTo` only when their actual block structure supports it. Lists emit `ItemList`; Legal pages emit `WebPage`. FAQ schema is emitted only from visible FAQ items.

## Media, CSP, and publication gates

All data media paths are local `/images/...`. Validation checks existence, real dimensions, per-game unique cover paths/hashes, three adopted game captures, and 1–3 adopted videos linked to `research/media-ledger.json`. Missing media is an error at media/release strictness, never a fallback.

`getPublishedGameFrameOrigins()` parses and deduplicates published additional URLs plus a safely parseable current main URL. Invalid additional URLs fail release. An invalid main first address is omitted and remains provisional. `csp.ts` is the only policy composer; final HTML and `_headers` are audited against its ordered origin set. Production has no `'unsafe-eval'`.

## Fingerprints and dates

`content-fingerprint.ts` canonicalizes only visible/behavioral inputs. Detail fingerprints include content, SEO, player, media, relations, and the actual ordered Featured/New/Recommended card fields. List fingerprints include ordered visible cards. Guide fingerprints include content, media, SEO, and actual related cards. Static entries are tracked in `seo/page-lastmod.json`; Game and Guide dates remain in their JSON while the state file stores only stable identity and fingerprint.

`npm run content:update` is the only mutating date/fingerprint mode. It preserves exact prior dates when fingerprints match and updates only changed/new records. `npm run content:release` and `npm run build` are read-only and fail on stale state. Initial creation date for this new site is 2026-09-21; that does not claim the domain has been deployed.
