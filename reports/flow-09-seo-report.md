# Flow 09 SEO Report

Date: 2026-09-21  
Status: complete

## Publication batch

The main game, eight additional games, and three Guides were switched from `draft` to `published` in one batch after media and release validation. New `publishedAt` and `updatedAt` values are `2026-09-21`, the date these records entered the deployable public route set. This does not claim the site has been deployed.

Krillion iframe status remains **provisional**. The supplied address is unchanged, the player validates it before creating one iframe, and failure/timeout/retry behavior is present. This report does not claim the daily game itself was verified playable inside the final production page. The eight additional game records use their own direct current build URLs and have title-specific runtime and effective-input evidence.

## Page inventory

The generated inventory is stored in `reports/seo-page-inventory.json`. It contains 19 indexable canonical pages:

- 1 homepage/main game entry;
- 8 additional game details;
- 1 More Games collection;
- 1 Guides collection;
- 3 Guide details;
- 5 root Legal/information pages.

There is no `/games/krillion`, no `/legal/*` public path, no internal preview route, and no topic page without an independently justified intent.

## TDK and H1

- All 19 production HTML pages have exactly one H1.
- All titles are unique and 40–60 Unicode characters; observed range: 40–49.
- All descriptions are 140–160 characters; observed range: 140–157.
- Home metadata is read through `seo/tdk.js` from `main-game.json`.
- Static page metadata exists only in `seo/tdk.js`.
- Additional game and Guide detail metadata is read only from the corresponding JSON object.
- All pages use `/images/og-image.png` as the 1200×630 Open Graph and large Twitter image.

## Canonical and structured data

Canonical, Open Graph URL, breadcrumb URLs, JSON-LD URLs, internal links, and sitemap paths share the configured origin `https://krilliongames.com` and the no-trailing-slash policy for non-root routes. The root canonical serializes as the origin and the sitemap root as the equivalent origin plus `/`.

Every page includes WebSite identity plus page-specific data. Game pages add WebPage, VideoGame, and breadcrumb semantics; Guide details add Article and breadcrumb semantics; `/games` and `/guides` add CollectionPage/ItemList semantics; Legal pages add WebPage semantics. No rating, review, price, fake author, or VideoObject is declared.

## Sitemap and fingerprints

`out/sitemap.xml` contains exactly the 19 expected canonical URLs and no duplicates. Homepage lastmod comes from the main game; game and Guide details use their own JSON date; static pages use `seo/page-lastmod.json`. Page fingerprints cover visible list cards, metadata, content, relations, player/media data, and static Legal source. Two consecutive unchanged production builds produced identical sitemap SHA-256:

`76EA9F0442964DA8C66506241029B88F6877D32EA3334FAAE02D11550A5019F3`

`robots.txt` allows public crawling, retains the retired preview-path disallow as defense in depth, and declares the formal sitemap URL. Research, planning, reports, handoff, and source JSON are not present in `out/`.

## Public navigation and third parties

Header, mobile menu, and Footer share the same three primary items: Home, Guides, More Games. Footer Legal links are root paths and include the exact `noopener noreferrer nofollow` relation. No public HTML anchor points to an external HTTP(S) page or `mailto:` address. Game iframes and click-created YouTube players are the documented third-party frame exceptions.

## Checks

- `npm run content:release`: passed for 9 games and 3 Guides.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 4/4 passed.
- `npm run build`: passed twice without sitemap date drift.
- `npm run audit:output`: passed; production CSP contains no `unsafe-eval`.
- `node scripts/audit-seo-output.mjs`: passed for all 19 pages.
