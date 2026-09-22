# Flow 07 Content Report

Date: 2026-09-21  
Status: complete

## Delivered game articles

Visible non-whitespace character counts exclude headings, media blocks, videos, JSON field names, and whitespace.

| Game | Characters | Main distinctions |
| --- | ---: | --- |
| Krillion | 7,552 | seven-prompt daily flow, valid rarity, depth, timed entry, safe failure |
| Guess Their Answer | 5,950 | three-round popular-answer survey, typed input, board feedback |
| Words of Wonders | 5,611 | letter-wheel tracing, crossword crossings, hints, progress |
| Word Detector | 5,687 | target lengths, anagram inventory, hint value, drag accuracy |
| Word Search Classic | 5,448 | straight-line scanning, reverse and diagonal search, grid selection |
| Text Twist 2 | 5,357 | timed rack, full-letter bingo, Twist, duplicate-letter control |
| Animal Quiz | 5,316 | photo identification, anatomical clues, answer length, tile spelling |
| Sweet Hangman | 5,420 | picture and pattern inference, limited misses, letter information |
| Word Bird | 5,223 | neighboring-tile routes, path planning, exact-length drag input |

Every article exceeds the 4,000-character publication floor without counting video text. No paragraph is copied between games. Each page covers the actual player task, start flow, input, objective, progression, mistakes, first-play strategy, device/browser behavior, and title-specific questions.

## Delivered Guides

- `How to Play Krillion`: 3,345 visible non-whitespace characters.
- `Krillion Scoring and Rare Answers`: 2,556 visible non-whitespace characters.
- `Krillion Loading and Input Help`: 3,115 visible non-whitespace characters.

Guide bodies, summaries, related IDs, tags, and 40–60/140–160 metadata are stored in their own JSON files. They remain `draft` with null publication dates until the media and prepublication gates finish.

## Metadata

All nine game titles are 40–60 characters and all nine descriptions are 140–160 characters. Main-page metadata remains sourced by `seo/tdk.js` from `main-game.json`; additional game metadata remains only in each game object. Guide detail metadata remains only in each Guide JSON.

## Research decisions

- Added one independent brief per game in `research/game-content-briefs.json`.
- Added the second-pass content and runtime record in `research/secondary-research.md`.
- Recorded the direct versioned player decision and live Guess Their Answer interaction in `research/evidence.json`.
- Preserved the user-supplied Krillion iframe exactly and kept its embed status provisional.
- Held eight discovered YouTube IDs for direct validation in Flow 08. No video is adopted yet.

## Checks

- `npm run content:dev`: passed with only expected Flow 08 cover warnings.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 4/4 passed.
- Independent visible-character counter: all 9 game articles passed.

## Flow 08 inputs

Flow 08 must supply each game with its own cover, at least three task-specific gameplay screenshots, and 1–3 verified YouTube embeds after the article. It must also create Guide covers, update media registration, and complete effective-input testing for all eight additional games. The main game needs an exact current-version video; failure to find one is a publication blocker but not a reason to corrupt or replace the supplied iframe.
