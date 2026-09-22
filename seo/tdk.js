/* eslint-disable @typescript-eslint/no-require-imports */
const mainGame = require("../data/games/main-game.json");

const staticTdk = {
  home: mainGame.seo,
  "games-index": {
    title: "More Games for Krillion Players to Explore",
    description: "Browse eight playable word, trivia, spelling, and deduction games selected for Krillion players, with clear controls and dedicated help on every game page."
  },
  "guides-index": {
    title: "Krillion Guides for Playing, Scoring, and Fixes",
    description: "Use focused Krillion guides to complete a first Daily Dive, understand rare-answer feedback, and solve loading, keyboard, sound, or mobile play problems."
  },
  privacy: {
    title: "Privacy Policy for the Krillion Player Website",
    description: "Read how the Krillion player website handles basic technical data, local browser storage, embedded games and videos, user choices, and privacy questions."
  },
  terms: {
    title: "Terms of Service for the Krillion Player Website",
    description: "Review the conditions for using the Krillion player website, including acceptable use, embedded game availability, responsibility limits, and future changes."
  },
  copyright: {
    title: "Copyright and Content Rights on the Krillion Site",
    description: "Review ownership of Checkpoint Nomad guides, third-party game media, permitted quotation, player comments, and the complete rights-notice process."
  },
  about: {
    title: "About Checkpoint Nomad and the Krillion Site",
    description: "Meet Checkpoint Nomad, the independent player behind this Krillion site, and learn how repeated runs become practical, carefully tested game guides."
  },
  contact: {
    title: "Contact Checkpoint Nomad About Krillion Guides",
    description: "Contact Checkpoint Nomad about verified corrections, accessibility, technical problems, privacy requests, media rights, attribution, or guide improvements."
  }
};

module.exports = staticTdk;
