# Flow 08 Media Report

Date: 2026-09-21  
Status: complete

## Adopted media

- Preserved and registered the original 240×64 transparent site Logo and 1200×630 social image generated for this site.
- Captured one local cover and three local 1280×720 explanatory states for the main game and each of the eight additional games.
- Created three distinct 1200×675 Guide covers in the site's depth-line visual system.
- Registered 50 adopted entries in `research/media-ledger.json`: 2 site designs, 36 game captures, 3 Guide covers, and 9 YouTube embeds.
- Updated all 59 planned media slots to `adopted` with traceable ledger IDs.
- Added three screenshot media IDs and one adopted YouTube media ID to every game content brief.

All public raster media is local. No provider thumbnail, aggregator image, YouTube thumbnail, or third-party SVG is hotlinked. Captures came from the configured current player builds and were exported as WebP without browser chrome. Every game keeps a separate path and cover hash.

## Video verification

One title-matched YouTube upload was selected for each game. oEmbed metadata resolved, the privacy-enhanced embed endpoint returned HTTP 200, and the watch pages showed no age-verification requirement. Directly opening an embed as a top-level page produced YouTube Error 153 because it lacks a parent-page Referer; that test was rejected. The accepted verification placed each embed under a local HTTP parent, created it after a click, and observed playback. The Krillion review frame visibly showed Daily Dive answer and depth feedback.

Public video behavior now:

- uses only `youtube-nocookie.com/embed/{validated-id}`;
- creates no iframe until the player selects Play video;
- does not autoplay;
- uses a local game cover before activation;
- exposes loading, ready, timeout/failure, and Retry feedback;
- does not publish a raw YouTube URL or external anchor.

## Runtime notes

All eight additional player builds rendered their own title-specific interface from a non-provider origin. Effective pointer or keyboard interaction was exercised against the current build; provider advertising and consent layers were treated as external runtime states and never adopted as gameplay media. Krillion remains `provisional`: the supplied address is preserved and its safe load/failure/retry behavior is implemented, but this report does not claim the embedded Daily Dive itself has been verified playable end to end.

## Data and code updates

- Game JSON now owns cover dimensions, three inline screenshot blocks, and one final video block per game.
- Guide JSON now owns distinct covers and task-adjacent Krillion captures.
- The Privacy page now describes click-to-load game and YouTube behavior.
- The production CSP includes only published game origins plus `https://www.youtube-nocookie.com`; production script policy does not contain `unsafe-eval`.
- Media validation, TypeScript, and ESLint passed after integration.

## Image generation record

The built-in image generation skill was used in Flow 06/08 for two original site assets:

- Logo mode: `logo-brand`, transparent horizontal KRILLION wordmark with a geometric K aperture and depth ticks, cyan/white on dark-header contexts.
- Social image mode: `ads-marketing`, 1200×630 abstract bathymetric field with seven waypoints, K mark, and the short KRILLION / PLAY THE DAILY DIVE message.

The final project assets are `/images/logo.png` and `/images/og-image.png`; generated working files outside the project are not runtime dependencies.
