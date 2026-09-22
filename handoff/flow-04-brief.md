# Flow 04 handoff — UI visual design

Status: **complete**

## Locked visual system

- Selected direction: dark bathymetric console, derived from Krillion's descent/depth interface but implemented with an independent typography, spacing, surface, and component system.
- Design signature: a cyan depth line with waypoints, used in the Logo, Header active state, player status, chapter transitions, card focus, and Footer divider.
- Container is 1400px wide when space permits. Base game grid is 992px + 28px + 380px; at 1024px it resolves to 648px + 16px + 320px. Only 1024px and 768px width breakpoints exist.
- The right rail uses parent-constrained, height-aware bidirectional sticky behavior through 1024px and becomes ordinary flow at 768px. It has no internal scrollbar.
- Player states, unique fullscreen icons, accessible focus states, compact rail cards, 6/4/2 game grid, responsive Guide list, and mobile game-page order are fully specified.

## Outputs

- `planning/design-brief.md`
- `planning/design-tokens.json`
- `planning/component-plan.md`
- `planning/responsive-plan.md`
- `planning/media-slots.json`

The media plan contains every stable game and Guide slot plus the required Logo and social image. All entries remain `planned` with empty ledger links until Flow 08 adopts independently verified files or videos.

## Development handoff

- Implement one shared data-driven shell. Missing per-game media, content, video, player, or SEO fields must fail validation instead of falling back.
- Game articles always consume the complete left track; only Guide details may use the 72ch reading measure.
- Use actual `ResizeObserver` and scroll testing for a tall rail; a normal-flow substitute is not acceptable.
- The main player is still provisional and must support safe rejection, timeout, and retry without blocking production output.
