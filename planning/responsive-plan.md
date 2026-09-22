# Responsive and boundary-following plan

Only `max-width: 1024px` and `max-width: 768px` width queries are allowed. Desktop is the base style; no container-width query or third viewport threshold may alter layout.

## Base / wide

- `.page-container` is `width: min(calc(100% - 48px), 1400px)` and becomes exactly 1400px when space permits.
- `.game-layout` is `grid-template-columns: minmax(0, 1fr) 380px; gap: 28px; align-items: start`.
- `.game-main` is one width-defining track. Player, status, Recommended, every article section and figure, FAQ, and video section use `width: 100%` with no nested max-width.
- `.game-rail` is `align-self: start`. A CSS variable sets the top offset to `var(--header-height) + 16px`. The common grid parent supplies the bottom containing boundary.
- `.games-grid` uses six columns; `.recommended-grid` uses three; `.rail-grid` always uses two.
- Desktop Header is 76px and displays inline navigation.

## 1024px and below

- Page horizontal padding becomes 20px and Header target height 68px.
- Desktop navigation hides and the hamburger reveals the identical shared list.
- `.game-layout` remains two columns: `minmax(0, 1fr) 320px`, gap 16px. No element in the left track has an intrinsic minimum width that can force overflow.
- Rail grid remains two columns. Category/helper lines hide; cover, two-line title, focus state and 44px link target remain.
- Recommended changes to two columns. More Games changes to four columns. Guides rows remain left-image/right-copy.
- Homepage H1 never exceeds 52px; other H1 never exceeds 40px.
- The rail continues height-aware boundary following using the current 68px measured Header height.

## 768px and below

- Page horizontal padding becomes 16px and Header target height 64px.
- `.game-layout` becomes one column. `HeightAwareRail` removes sticky styles and its controller stops observing scroll.
- CSS grid areas enforce: player/title unit → Recommended → article → videos → Featured → New. The two rail groups become ordinary sections but each retains a two-column card grid.
- More Games becomes two columns. Recommended remains two. Guides rows stack cover over copy.
- Homepage H1 never exceeds 40px; other H1 never exceeds 34px. Body copy is at least 16px.
- Status controls remain 44px. Text may wrap above the controls but controls never overlap the mobile safe area.
- Footer groups stack and every link retains a 44px target.

## Height-aware rail algorithm

1. Measure Header, rail, viewport, and parent end with `ResizeObserver`; recalculate after fonts and images settle.
2. If rail height fits between Header offset and viewport bottom safe gap, use `position: sticky; top: var(--rail-top)`.
3. If taller, preserve its document position and track scroll direction. While scrolling down, let content move until the rail bottom reaches the viewport bottom gap, then anchor with an equivalent negative `top` value. While scrolling up, release that edge and re-anchor only when the rail top reaches the Header offset.
4. Native sticky remains constrained by the grid parent, so the rail stops at the parent bottom and cannot cover Footer. JavaScript changes only CSS custom properties/state attributes; it never uses permanent fixed positioning.
5. No `overflow-y`, `max-height`, or internal scrollbar is applied to the rail. At 768px observers/listeners detach.

## Verification viewports

- 1536×960: container resolves to 1400px; player about 992px wide; rail 380px; Footer remains uncovered through a full scroll.
- 1024×768: content width 984px; left track 648px; rail 320px; two rail columns remain readable and no horizontal overflow exists.
- 768×1024 and 390×844: single-column order exactly matches the locked sequence; menu, controls, two-column compact cards, figures, and Footer fit without clipping.

Browser QA must record top, middle, bottom, and upward-scroll rail positions for both a tall desktop viewport and 1024px. A static screenshot alone does not prove the bidirectional boundary behavior.
