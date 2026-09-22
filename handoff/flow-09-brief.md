# Flow 09 Handoff

Status: complete  
Next: Flow 10 — production runtime, responsive, accessibility, and final deployable-output acceptance

## Ready

- Published batch: 1 main game, 8 additions, 3 Guides.
- 19 unique canonical pages with valid TDK and one H1 each.
- Page-specific JSON-LD plus global WebSite identity.
- Standard 19-URL sitemap with stable per-page dates.
- Robots, social metadata, CSP, internal links, and Footer Legal relations validated.
- Two unchanged production builds and static-output audit passed.

## Flow 10 focus

1. Serve `out/` through the local production preview and map every sitemap path to HTTP 200.
2. Run desktop, 1024px, and 768px page checks, including rail boundaries and required reordering.
3. Verify game and video click-to-load behavior, unique iframe creation, error recovery, fullscreen controls, console/network/CSP cleanliness, and card-to-game identity mapping.
4. Confirm text character floors and data sets again from production output.
5. Record Krillion iframe as `provisional`, not verified playable.
6. Deliver `out/` only; do not deploy or commit.
