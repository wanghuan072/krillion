# Flow 02 Brief

## Status

`completed_with_warnings`

## Confirmed Inputs

- Primary display name: `Krillion`
- Site language: English
- Target market: global English-speaking browser-game players
- Main iframe: unchanged at `https://www.krillion.org/play/daily/`
- Main runtime status: `provisional`

## Outputs

- `research/initial-research.md`
- `research/evidence.json`
- `research/keyword-signals.json`
- `research/game-runtime-profile.json`
- `research/additional-game-candidates.json`
- Updated `project.yaml` and `data/games/main-game.json`

## Locked Decisions

- Krillion is treated as an open-answer daily trivia/guessing game, not a Wordle clone.
- Public language is English and the market is global English-speaking players.
- No main-navigation topic page has enough independent value. The base navigation remains Home → Guides → More Games.
- Eight additional-game candidates are retained: Guess Their Answer, Words of Wonders, Word Detector, Word Search Classic, Text Twist 2, Animal Quiz, Sweet Hangman, and Word Bird.
- Direct itch.io build URLs are excluded because a non-itch parent receives an anti-hotlink replacement page.
- Main player layout starts from `16 / 9` landscape. The main iframe is still provisional.

## Decisions The Next Flow May Change

- Flow 03 may choose two or three Guide details from the scored candidates, but must include at least two.
- Exact related-game ordering and homepage Featured/New/Recommended flags are planned in Flow 03.
- A topic page may be added only if new evidence supplies a separate player task, unique facts, and its own explanatory media; current evidence supports zero.

## Known Gaps

- The main iframe showed its loading screen from the isolated project origin but did not complete an answer input; it remains provisional.
- Each retained additional game rendered from the isolated origin and has a provider-supported placement URL, but final goal-related input must be completed on the built route before publication.
- YouTube IDs are candidates, not adopted media. The main game still needs a qualified exact video candidate.
- Touch, storage, audio, and reload behavior need secondary checks.
- Search volume is unavailable; keyword strength is explicitly qualitative.

## Required Reads For The Next Flow

- Flow 03 instructions.
- Game and Guide JSON specifications.
- Player interaction and status/handoff specifications.
- All Flow 02 research outputs.

## Next Flow Instructions

Define the complete public route registry and content ownership. Keep zero topic pages unless new evidence changes the conclusion. Plan at least two Guide details, all eight additional-game details, the exact homepage and per-detail recommendation rules, unique article outlines and three-image tasks for every game, and the final navigation/Legal structure without creating pages or code.
