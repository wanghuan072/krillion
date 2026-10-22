import fs from "node:fs";
import path from "node:path";
import { readAnswerArchive, answerPath } from "../scripts/lib/daily-answers.mjs";

export function publicSiteOrigin(root = process.cwd()) {
  const source = fs.readFileSync(path.join(root, "src/config/site.ts"), "utf8");
  const value = source.match(/origin:\s*"([^"]+)"/)?.[1];
  if (!value || new URL(value).protocol !== "https:") throw new Error("Missing HTTPS canonical origin");
  return new URL(value).origin;
}

export function stateRoutes(state) {
  return [
    ...Object.entries(state.staticPages ?? {}).map(([path, record]) => ({ path, group: "staticPages", id: path, ...record })),
    ...Object.entries(state.games ?? {}).map(([id, record]) => ({ path: `/games/${record.slug}`, group: "games", id, ...record })),
    ...Object.entries(state.guides ?? {}).map(([id, record]) => ({ path: `/guides/${record.slug}`, group: "guides", id, ...record })),
    ...Object.entries(state.answers ?? {}).map(([date, record]) => ({ path: answerPath(date), group: "answers", id: date, ...record })),
  ];
}

export function discoverStaticPages(root = process.cwd()) {
  const pages = [];
  function visit(directory, segments) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("@") && !entry.name.includes("[")) visit(path.join(directory, entry.name), entry.name.startsWith("(") ? segments : [...segments, entry.name]);
      else if (entry.isFile() && /^page\.(?:tsx?|jsx?)$/.test(entry.name)) pages.push(`/${segments.join("/")}`);
    }
  }
  visit(path.join(root, "app"), []);
  if (new Set(pages).size !== pages.length) throw new Error("Two static pages have the same public URL");
  return pages;
}

export function prepareSiteState(previous, { root = process.cwd(), now = new Date().toISOString() } = {}) {
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const staticPaths = discoverStaticPages(root);
  const orderedPaths = [...Object.keys(previous.staticPages ?? {}).filter((route) => staticPaths.includes(route)), ...staticPaths.filter((route) => !previous.staticPages?.[route]).sort()];
  const initial = (record) => record ?? { fingerprint: "0".repeat(64), lastModified: now, awaitingRender: true };
  const published = (records) => records.filter((record) => record.status === "published");
  const games = published(read("data/games/games.json"));
  const guides = published(fs.readdirSync(path.join(root, "data/guides")).filter((file) => file.endsWith(".json")).map((file) => read(`data/guides/${file}`)));
  const answers = readAnswerArchive(root);
  const state = {
    schemaVersion: 4, fingerprintVersion: previous.fingerprintVersion ?? "legacy-source-v3",
    staticPages: Object.fromEntries(orderedPaths.map((route) => [route, { ...initial(previous.staticPages?.[route]), pageId: previous.staticPages?.[route]?.pageId ?? (route.slice(1) || "home") }])),
    games: Object.fromEntries(games.map((game) => [game.id, { ...initial(previous.games?.[game.id]), slug: game.slug }])),
    guides: Object.fromEntries(guides.map((guide) => [guide.id, { ...initial(previous.guides?.[guide.id]), slug: guide.slug }])),
    answers: Object.fromEntries(answers.map((dive) => [dive.date, initial(previous.answers?.[dive.date])])), deletedAt: { ...(previous.deletedAt ?? {}) },
  };
  const active = new Set(stateRoutes(state).map((record) => record.path));
  for (const record of stateRoutes(previous)) if (!active.has(record.path) && !state.deletedAt[record.path]) state.deletedAt[record.path] = now;
  return state;
}
