# Krillion visual design brief

## Selected direction: curated arcade editorial

Krillion uses a cover-first game portal interface with a compact editorial hierarchy. The site shell stays restrained so each game's real artwork supplies most of the color. Its visual identity now follows the Daily Dive itself: deep navy surfaces, ice-cyan controls, hot-magenta scoring accents, and compact condensed headings.

The background uses the verified Krillion Daily Dive prompt capture already adopted for the main game. A strong navy veil preserves text contrast and lets the prompt, depth display, cyan input field, and magenta Dive control register as game-specific atmosphere instead of competing with page content. Soft cyan and magenta fields extend the same visual system without adding unrelated scenery, decorative line drawings, fake interface diagrams, particles, or glass panels.

## Brand system

- Local Header logo: navy and ice-cyan angular `K`, warm-white `KRILLION` wordmark, and hot-magenta `PLAY MORE. PLAY FURTHER.` line.
- Primary action: solid ice cyan (`#53e8f2`) with deep-navy text.
- Main text: cool off-white (`#f4f8fb`); secondary text uses blue gray (`#9badbd`).
- Header navigation is text-only. The current page uses a narrow cyan underline.
- Display headings use compact condensed forms at restrained responsive sizes.
- Section headings use one small cyan square. No multi-color rules or decorative chapter graphics.

## Game-page composition

At desktop width, the existing 1400px container remains split into a flexible player/article column and a 380px recommendation rail. The rail is static and uses a slightly darker background field. Featured Games and New Games each contain six image-first cards in two columns. Six Recommended Games appear immediately below the player; they use one row at wide desktop widths and two columns at the 1024px breakpoint.

A game-specific Player Ratings panel follows New Games in the same rail. It uses the shared navy field, cyan controls, and magenta scoring color while keeping the form, feedback, and individual reviews visually separate from recommendation cards. Each page loads and posts against its own stable game slug.

The player has a thin cyan-blue border, modest radius, cover image, centered cyan `Play Now` control, and a compact status strip. Game cards use a square media area because the adopted catalog covers are square; `object-fit: contain` preserves every cover without cropping. Titles sit below the artwork rather than inside heavy containers. Hover and focus states strengthen the image edge without covering the cover.

At 768px and below the established single-column order remains player, Recommended, article, videos, Featured, then New. More Games remains 6/4/2 columns across wide, 1024px, and 768px layouts. Guides retain their wide left-image/right-copy and mobile stacked layouts.

## Reading and supporting pages

Long-form game content stays the full width of the left column and uses simple section dividers. Screenshots and videos use the same restrained border and radius as the player. Guide and legal pages reuse the palette and typography without adding game-page chrome.

## Accessibility and motion

The photographic background is decorative CSS and never enters the accessibility tree. Cyan and magenta are paired with shape, underline, or words rather than used as the sole state signal. Focus rings remain visible, all controls keep 44px minimum targets, and reduced-motion preferences disable loading and lift animations. Only the 1024px and 768px responsive width breakpoints are used.
