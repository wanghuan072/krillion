# Initial Research: Krillion

## Status

Completed on 2026-09-21 for an English-language site aimed at global English-speaking browser-game players.

## Keyword Boundary

Krillion is the proper display name. The locked homepage game name remains the single startup token, with natural capitalization and no added punctuation. The observed game is a daily open-answer trivia/guessing challenge built around a descent metaphor. It is not a Wordle clone, a hidden-word game, the unrelated krillion meme spelling, or a conventional multiple-choice quiz.

The strongest player vocabulary is: Daily Dive, seven prompts, typed answer, rare answer, points, depth, timer, accepted answer, missed prompt, and next dive. Pages using a different timer length or reset claim are treated as secondary; the live build wins whenever facts conflict.

## Search Result Overview

The current result set is unusually crowded with recent exact-match guide domains. Most satisfy one of four tasks: play immediately, learn the first run, understand rarity scoring, or find similar quick thinking games. Community posts show genuine “games like Krillion” demand, while authoritative technical documentation is thin. This creates room for a player-first homepage plus focused Guides, but not for thin keyword variants.

Numeric search volume was not available. `keyword-signals.json` therefore records qualitative result maturity, repeated task language, and observed page types rather than invented values.

## Player Task Clusters

| Cluster | Core task | Representative queries | Intent | Depth | Recommended owner |
| --- | --- | --- | --- | --- | --- |
| `play-now` | Start today's game quickly | krillion, krillion game, krillion daily | Very high | Strong when paired with accurate player content | Homepage |
| `first-dive` | Understand the flow before the timer starts | how to play krillion, krillion rules, how many prompts | High | Complete step-by-step Guide | Guide detail |
| `score-and-depth` | Understand why an answer scored as it did | krillion scoring, rare answers, depth points | High | Independent mechanics explanation | Guide detail |
| `strategy` | Improve answer quality without invalid guesses | krillion tips, rare answer strategy | Medium-high | Useful but overlaps scoring | Merge into scoring Guide and homepage advice |
| `runtime-help` | Recover loading, focus, keyboard, sound, or mobile input | krillion not loading, krillion mobile, timer expired | Medium | Troubleshooting Guide/FAQ section | Guide detail |
| `alternatives` | Find similar short word and trivia games | games like krillion | Emerging | Eight verified game details plus list | More Games |

## Page Candidate Scoring

Scores use 1–5 for relevance, demand, independence, depth, evidence, media, maintainability, and Guide fit.

| Candidate | Rel. | Demand | Independent | Depth | Evidence | Media | Maintain | Guide fit | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| How to Play Krillion | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 5 | Guide detail |
| Krillion Scoring and Rare Answers | 5 | 4 | 5 | 5 | 4 | 5 | 3 | 5 | Guide detail |
| Krillion Loading and Input Help | 5 | 3 | 4 | 4 | 4 | 4 | 3 | 5 | Third Guide if Flow 03 retains it |
| Krillion Strategy | 5 | 4 | 3 | 4 | 3 | 4 | 3 | 3 | Merge into scoring Guide |
| Today's Answers | 4 | 4 | 2 | 2 | 1 | 2 | 1 | Do not publish; volatile and encourages answer copying |
| Archive / previous dives | 3 | 3 | 2 | 2 | 1 | 2 | 1 | Do not publish without a verified archive source |

## Main Navigation Topic Evaluation

No additional topic page is recommended. “Scoring,” “strategy,” and “how to play” are clear Guide tasks rather than durable top-level site sections. “Today's answers” and “archive” would require volatile data that the supplied build does not expose as a stable, verifiable editorial source. The Header therefore remains Home → Guides → More Games.

If a topic were promoted, it would need a distinct entry task, at least two facts not already owned by the homepage or Guides, and explanatory game captures. No candidate currently clears all three conditions, so empty navigation capacity is intentionally left unused.

## Main Game Facts And Runtime

- The live supplied URL showed the Krillion daily interface with seven prompt progress, score, depth, a sound toggle, result feedback, and a Descend action.
- The core loop is a timed typed answer to a prompt/category, followed by acceptance and rarity feedback. The descent presentation translates the run into depth.
- The game is landscape-first. A `16 / 9` player frame preserves the observed interface without assuming the game itself adapts to every device.
- Keyboard and mouse support were observed. Touch is plausible but not promoted to verified until the built player is tested at mobile width.
- The supplied HTTPS page returned no observed `X-Frame-Options` or `frame-ancestors` restriction. It rendered a Loading Dive screen inside the isolated local-origin iframe.
- The bounded iframe test did not complete a new prompt and effective answer input. The main game therefore remains `provisional`; this does not block build or delivery.

## Additional Game Candidate Outcome

Fifteen candidates were evaluated. Eight provider-supported games are retained:

1. Guess Their Answer
2. Words of Wonders
3. Word Detector
4. Word Search Classic
5. Text Twist 2
6. Animal Quiz
7. Sweet Hangman
8. Word Bird

Each retained game has a public HTTPS placement URL explicitly presented for use on another website, a distinct named launch screen rendered from the isolated local parent, enough unique mechanics for a standalone article, a three-capture gameplay plan, and one exact YouTube candidate registered for Flow 08 review. All eight still require an effective goal-related input test on their final built route before publication.

Seven itch.io discoveries were excluded. Direct `html-classic.itch.zone` links were replaced by an itch.io anti-hotlink warning when loaded from a non-itch parent. A successful top-level page or an itch-owned embed is not sufficient for this site's iframe.

## Risk Review

No adult, gambling, realistic violence, horror, or minors-related sensitive material was observed in Krillion or the eight retained games. Sweet Hangman removes parts from a cartoon gingerbread figure after wrong guesses; this is abstract, non-graphic, and described without violent framing. Guess Their Answer uses audience and cash-like game rewards but no staking or chance-based wagering was observed. These are content observations, not legal conclusions, and are rechecked during the final gameplay pass.

## Media Feasibility

The main game and every retained additional game can produce a unique local cover plus three different self-captured gameplay explanations. The retained video IDs are recorded only as candidates. Flow 08 must watch each clip, confirm current-game and version match, confirm YouTube embedding, create a local poster, and reject anything generic, misleading, unavailable, or unrelated.

The main game's YouTube search did not yet yield a qualified clip. That remains a Flow 07–08 publication blocker to resolve through narrower title/interface searches; an unrelated generic trivia video is not acceptable.

## Secondary Research Checklist

- Complete one effective answer inside the final Krillion iframe if the daily state permits; otherwise preserve provisional status and validate failure/retry behavior.
- Complete one goal-related input in every additional game on its built page.
- Verify all eight candidate YouTube clips by watching them, not by title alone.
- Capture current images only after the final game version and viewport are locked.
- Reconcile timer and reset wording against the live UI before public copy.
- Confirm touch, focus, storage, audio, and reload behavior for each game.

