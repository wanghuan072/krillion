<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Krillion project rules

- Treat this directory as the only project boundary. Never read or reuse another game project's code, content, media, branding, or configuration, and preserve existing architecture and user changes.
- Keep the shared navigation in the order Home (`/`), zero to two research-supported topic pages, Guides (`/guides`), More Games (`/games`). The main game exists only at `/`; additional games use `/games/[slug]`.
- Use `data/games/main-game.json` and `data/games/games.json` as the only Game sources. Use one strict Guide JSON source. A stable Game ID owns its title, slug, description, cover, content, and sole `player.iframeSrc`; never fall back to another game or a placeholder.
- Publish at least eight verified additional games. Homepage Featured and New each contain 6–8 explicitly flagged games and Recommended contains exactly six. Derive lists, details, players, metadata, structured data, CSP, recommendations, and sitemap from the shared data.
- Derive production `frame-src` from published additional games and any safely parseable current main-game origin. If the provisional main address is unsafe, do not broaden CSP or create an iframe; show a clear retryable failure. Never duplicate iframe addresses in code or config.
- Every published game requires its own accurate cover, at least three distinct explanatory gameplay captures, 1–3 adopted and playable YouTube embeds after the article, and at least 4000 non-whitespace visible article characters. Do not use repeated prose, media metadata, or keyword stuffing to reach the threshold.
- Keep public copy player-focused. Do not expose research, collection, attribution-process, internal status, or report language. Do not create public third-party anchors except approved embedded YouTube controls. Do not add comments or ad placeholders.
- Use `/images/logo.png` in the Header and `/images/og-image.png` for every social image. Preserve the startup keyword punctuation in the homepage H1.
- Centralize static-page metadata in `seo/tdk.js`; it must read homepage values from the main Game JSON. Keep additional-game and Guide-detail metadata only in their JSON. Titles are 40–60 characters and descriptions 140–160 characters.
- Footer Legal links are `/privacy`, `/terms`, `/copyright`, `/about`, and `/contact`, use `rel="noopener noreferrer nofollow"`, and remain in the same tab. Contact shows plain text `wyong@krilliongames.com`, with no form or `mailto:` link.
- Generate sitemap entries and canonical URLs from the public registry and content fingerprints. Preserve last-modified dates unless visible content or recommendations materially change.
- Use a 1400px maximum desktop container and only the 1024px and 768px width breakpoints. Desktop and 1024px game pages retain the two-column player/article plus height-aware sticky sidebar layout. At 768px and below disable sticky and order player, six Recommended, article, videos, Featured, then New.
- Header desktop/mobile and Footer navigation share one configuration. Guides require a list plus at least two complete details. More Games is 6/4/2 columns at wide/1024/768 layouts.
- Every production additional-game page must show real game imagery and pass an effective input test in a clean browser context. The provisional main game must safely create exactly one configured iframe or safely refuse it, with timeout/failure feedback and retry.
- The website README is English, player-facing, links every Header and Footer Legal page, and does not describe the directory structure. Do not deploy or commit Git unless the user explicitly requests it.
