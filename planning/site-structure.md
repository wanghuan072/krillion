# Krillion site structure

## Locked identity and URLs

- Site and short name: **Krillion**. This preserves the verified product name and does not imply an official relationship.
- Language and market: English for a global English-speaking audience.
- Canonical origin: `https://krilliongames.com`.
- Trailing slashes: disabled. `/path/` redirects to `/path` at the hosting layer when supported.
- Header, mobile menu, and Footer use one ordered navigation array: Home `/`, Guides `/guides`, More Games `/games`.
- No topic page was approved. The researched topic candidates overlap the homepage or one of the three Guides and do not justify a separate navigation destination.
- Krillion's only game page is `/`. `/games/krillion` must never be generated.

## Public routes and responsibilities

| Route | Responsibility |
| --- | --- |
| `/` | Play Krillion safely, understand the seven-prompt Daily Dive, and continue into substantial first-run, scoring, strategy, and troubleshooting content. |
| `/games` | Browse every published additional game from `games.json` in a 6/4/2 responsive grid. |
| `/games/[slug]` | Play one additional game and read an independently researched player guide for that exact game. Eight slugs are planned. |
| `/guides` | Browse all published Krillion Guides in image-left/copy-right rows, stacking on mobile. |
| `/guides/how-to-play-krillion` | Complete a first Daily Dive from launch to results. |
| `/guides/krillion-scoring-and-rare-answers` | Interpret score/depth feedback and balance unusual answers against validity. |
| `/guides/krillion-loading-and-input-help` | Recover loading, focus, sound, sizing, and retry problems. |
| `/privacy`, `/terms`, `/copyright`, `/about`, `/contact` | Long-lived Legal and site-information pages linked only from the Footer Legal group. |

## Shared game-page layout contract

The homepage and all eight additional game details use one game-page skeleton and one player component. The desktop container is fluid up to exactly 1400px. Above 768px the page uses a left content track plus a right rail. The left track contains H1/introduction, player, six Recommended cards, the full article, and the video section. The article never narrows inside that track and never expands below the rail. The rail contains Featured Games and New Games, each with 6–8 two-column cards.

At desktop and 1024px, the rail is constrained by the same grid parent as the entire left track. Its top boundary is the measured Header height plus the spacing token; its bottom boundary is the grid parent's end. A height-aware bidirectional sticky controller changes the anchored edge only after scroll direction and boundary checks, so a rail taller than the available viewport can be reached at both ends without an internal scrollbar. It may not cross the Header or Footer. At 768px and below sticky is disabled and the order is player, six Recommended cards, article, video, Featured, New.

The player starts with a real focusable `Play Now` button over the current game's own cover. One click may create at most one iframe. Safe URLs receive loading, ready, timeout, failure, and retry states. An unsafe or rejected main URL enters a visible failure state without creating an iframe. The status bar contains visibly different webpage-fullscreen and browser-fullscreen SVG icons.

## Independent game article plans

- **Krillion**: the Daily Dive premise; the seven timed prompts; entering and submitting one unrestricted answer; accepted-answer, points, and depth feedback; choosing specific but defensible responses; time-pressure errors; keyboard, mobile, sound, and reload behavior; a verified FAQ. Media explains launch, an active prompt, and result/depth feedback.
- **Guess Their Answer**: three-round popular-answer competition; typed answer recognition; audience totals and opponent pacing; virtual-cash rewards; when synonyms fail; building from obvious to secondary answers; keyboard and compact-screen behavior. Media explains the prompt, revealed answer board, and reward/results state.
- **Words of Wonders**: dragging through a letter wheel; filling crossword-shaped blanks; bonus words and hints; landmark progression; overlapping-letter inference; dead-end paths; touch accuracy and board fit. Media explains wheel input, grid completion, and map/progression.
- **Word Detector**: tracing words through scrambled letters; reading target lengths; coins and hints; rejected chains; exhausting combinations systematically; small-screen path control. Media explains the initial board, an active chain, and a completed target set.
- **Word Search Classic**: scanning a dense grid; following the displayed word list; horizontal, vertical, diagonal, and reverse selection; avoiding near-miss drags; completion tracking; pointer precision. Media explains the untouched grid, a drag selection, and progress after several finds.
- **Text Twist 2**: forming words from the rack; using Twist as a search tool; time pressure, word-length slots, and the bingo word; submitting and clearing entries; keyboard focus; planning short words before the long solution. Media explains the rack, filled word slots, and a bingo/round transition.
- **Animal Quiz**: identifying a photographed animal; entering letters from a bank; separating visual recognition from spelling; consequences of wrong picks; stage progression; using distinctive features before guessing. Media explains the clue, letter entry, and solved state.
- **Sweet Hangman**: using an image clue and word pattern; selecting letters; reading the limited-miss gingerbread indicator; safe vowel/consonant choices; unlock progression; touch controls. Media explains the first clue, accumulated misses, and solved word.
- **Word Bird**: discovering target words in a compact letter grid; dragging paths with direction changes; overlap and revisit rules; score/progress; recognizing stems; avoiding accidental releases on touch screens. Media explains the fresh grid, an active path, and target progress.

Every plan has a publication floor of 4,000 visible non-whitespace characters after the player. This is a minimum, not a target or cap. The final writing must remain game-specific and evidence-backed.

## Guides and lists

The Guides index reads only published Guide JSON files. Its wide and 1024px rows place the cover to the left and copy to the right; at 768px and below each row stacks image above copy. The More Games index reads only published additional Game objects and uses 6 columns above 1024px, 4 columns at 1024px and below, and 2 columns at 768px and below.

## Footer and auxiliary routes

The Footer repeats the shared primary navigation and provides a distinct Legal group containing Privacy Policy, Terms of Service, Copyright, About Us, and Contact Us at the five root paths. Legal links use the current tab and `rel="noopener noreferrer nofollow"`. Contact displays `wyong@krilliongames.com` as plain text. The copyright line derives the build year and site name from shared configuration.

## Explicit exclusions

There is no comments area, ad placeholder, rating control, Hot/Popular/Trending section, duplicate main-game route, `/legal/` public prefix, thin topic landing page, or public research/source language. Daily answers and a separate strategy page are not published in this release.
