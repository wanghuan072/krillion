# Code structure for Next.js 16.3.5

The create-next-app App Router starter is retained. It becomes a statically exported site (`output: "export"`) because every public route is known from local JSON at build time. Next.js 16.3.5 local documentation confirms that App Router Server Components run at build time, dynamic routes require `generateStaticParams`, default image optimization is unavailable in export mode, and the result is portable in `out/`. Native `<img>` is therefore used for local, dimensioned media; no remote image loader or server runtime is introduced.

## Existing files to modify

- `package.json`: add validation, content-date, test, browser-audit, typecheck, check, and production-preview scripts; build runs the complete release validator before `next build`.
- `next.config.ts`: set `output: "export"`, `trailingSlash: false`, disable default image optimization, and keep the production build serverless.
- `tsconfig.json`: change `@/*` to `./src/*` while allowing root JSON/SEO imports through explicit relative modules.
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`: replace starter implementation; route files remain thin framework boundaries and the global stylesheet moves to `src/style/globals.css`.
- `README.md`: replace the starter document with the required English player-facing site guide and route links; commands live only in the internal build report.
- `data/games/main-game.json`, `data/games/games.json`: migrate once to the current strict Game schema and then remain the only game facts/content entry.
- `project.yaml`: locked to npm, Node 24.19.0, App Router static generation, and `out/`.

Starter SVG assets under `public/` are removed only after the new assets are present because they are unused framework branding, not user content.

## Files to create

```text
app/
  about/page.tsx
  contact/page.tsx
  copyright/page.tsx
  games/page.tsx
  games/[slug]/page.tsx
  guides/page.tsx
  guides/[slug]/page.tsx
  privacy/page.tsx
  terms/page.tsx
  not-found.tsx
  robots.ts
  sitemap.ts
src/
  page/home/HomePage.tsx
  page/games/GamesPage.tsx
  page/games/GameDetailPage.tsx
  page/guides/GuidesPage.tsx
  page/guides/GuideDetailPage.tsx
  page/legal/{AboutPage,ContactPage,CopyrightPage,PrivacyPage,TermsPage}.tsx
  components/layout/{SiteHeader,MobileMenu,SiteFooter,PageContainer}.tsx
  components/game/{GamePageShell,GamePlayer,PlayerStatusBar,HeightAwareRail,GameCard,GameGroup,GameArticle,GameVideoSection}.tsx
  components/content/{ContentBlocks,Figure,Callout,Faq}.tsx
  components/guides/{GuideCard,GuideRenderer}.tsx
  config/{site,navigation,static-pages}.ts
  lib/data/{game-loader,guide-loader}.ts
  lib/validation/{game-schema,guide-schema,media-schema,seo-schema}.ts
  lib/{url-policy,csp,content-fingerprint,selection}.ts
  seo/{metadata,json-ld}.ts
  types/{game,guide,site}.ts
  style/globals.css
  style/layout/{site-header,site-footer}.module.css
  style/game/{game-page,game-player,game-card,game-content}.module.css
  style/guides/{guide-list,guide-detail}.module.css
  style/page/{index,legal}.module.css
data/guides/
  how-to-play-krillion.json
  krillion-scoring-and-rare-answers.json
  krillion-loading-and-input-help.json
seo/
  tdk.js
  page-lastmod.json
scripts/
  validate-content.mjs
  update-content-state.mjs
  verify-static-output.mjs
  emit-host-files.mjs
tests/
  content.test.mjs
  browser.spec.ts
playwright.config.ts
public/images/
  logo.png
  og-image.png
  games/<stable-id>/...
  guides/...
```

`app` is only URL/framework wiring. Complete pages live in `src/page`, reusable UI in `src/components`, all handwritten CSS in `src/style`, data access/calculation in `src/lib`, types in `src/types`, and shared metadata builders in `src/seo`. Root `data/`, `seo/tdk.js`, and `seo/page-lastmod.json` retain their workflow-mandated logical locations rather than being copied to `src/data`.

## Dependency direction

`app → page → components/lib/seo/style`; `lib → root data/types/config`; shared components never import a page. Server Components load and validate JSON at build time. Client Components are limited to menu, player, fullscreen, video click-to-load, and tall-rail observation.

## Rendering and security

All public pages are prerendered. Game and Guide dynamic segments use `generateStaticParams()` and `dynamicParams = false`. Metadata is produced at build time from the same validated objects.

Because Next static export does not support `headers()` and nonce CSP requires dynamic rendering, the build derives one production policy from published Game origins and emits it in two forms: a CSP `<meta http-equiv>` for portable enforcement of `frame-src` and script/style/resource rules, and `out/_headers` for static hosts that understand that convention. Production never includes `'unsafe-eval'`; local development alone adds it for framework diagnostics. A release audit reads final HTML and `_headers` and compares `frame-src` with the loader's origin set.

## Package and output lock

- Package manager: npm with the existing lockfile.
- Runtime used for this build: Node.js 24.19.0.
- Framework: Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5.9.3.
- Rendering: build-time static generation plus focused client islands.
- Output: `out/`, served by any static server with extension fallback for slashless URLs.
- Automated browser tests: `@playwright/test` using the installed Chrome channel; installation occurs in Flow 06.
- No deployment and no Git commit are part of this workflow.
