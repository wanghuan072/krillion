import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "dev";
const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const main = read("data/games/main-game.json");
const games = read("data/games/games.json");
const guideFiles = fs.readdirSync(path.join(root, "data/guides")).filter((name) => name.endsWith(".json"));
const guides = guideFiles.map((name) => ({ file: name, value: read(`data/guides/${name}`) }));
const errors = [];
const warnings = [];
const add = (condition, message) => { if (!condition) errors.push(message); };
const exactKeys = (value, expected, label) => add(JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort()), `${label}: unexpected or missing fields`);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const requiredSandbox = ["allow-scripts", "allow-same-origin", "allow-forms", "allow-pointer-lock", "allow-orientation-lock", "allow-modals"];
const forbiddenSandbox = ["allow-popups", "allow-popups-to-escape-sandbox", "allow-top-navigation", "allow-top-navigation-by-user-activation"];

exactKeys(main,["id","slug","title","shortDescription","status","publishedAt","updatedAt","tags","categories","flags","image","player","seo","content","relatedGameIds"],"main game");
add(Array.isArray(games) && games.length >= 8, "games.json must contain at least eight planned additions");
const allGames = [main, ...games];
for (const game of allGames) {
  add(slug.test(game.id) && slug.test(game.slug), `${game.id}: invalid id or slug`);
  exactKeys(game.flags,["isNewHome","isFeaturedHome","isRecommendedHome"],`${game.id}.flags`);
  exactKeys(game.image,["src","alt","width","height"],`${game.id}.image`);
  exactKeys(game.player,["iframeSrc","aspectRatio","orientation","permissionsPolicy","referrerPolicy","sandbox","loadTimeoutMs"],`${game.id}.player`);
  add(typeof game.player.iframeSrc === "string", `${game.id}: iframeSrc must be a string`);
  add(game.id === "krillion" || /^https:\/\//.test(game.player.iframeSrc), `${game.id}: additional iframe must use HTTPS`);
  add(game.id === "krillion" || game.player.iframeSrc === `https://azgames.io/${game.slug}.embed`, `${game.id}: additional iframe must use its matching AZGames embed path`);
  const sandbox = Array.isArray(game.player.sandbox) ? game.player.sandbox : [];
  add(requiredSandbox.every((token) => sandbox.includes(token)), `${game.id}: required iframe sandbox capabilities missing`);
  add(forbiddenSandbox.every((token) => !sandbox.includes(token)), `${game.id}: iframe sandbox permits popups or top navigation`);
  add(new Set(game.relatedGameIds).size === game.relatedGameIds.length && !game.relatedGameIds.includes(game.id), `${game.id}: invalid relatedGameIds`);
  if (!game.image.src) warnings.push(`${game.id}: cover pending Flow 08`);
  if (!game.content.length) warnings.push(`${game.id}: content pending Flow 07`);
}
add(new Set(allGames.map((game) => game.id)).size === allGames.length, "duplicate game ID");
add(new Set(allGames.map((game) => game.slug)).size === allGames.length, "duplicate game slug");
for (const game of games) for (const id of game.relatedGameIds) add(games.some((candidate) => candidate.id === id), `${game.id}: missing related game ${id}`);
add(games.filter((game) => game.flags.isFeaturedHome).length >= 6 && games.filter((game) => game.flags.isFeaturedHome).length <= 8, "Featured count must be 6-8");
add(games.filter((game) => game.flags.isNewHome).length >= 6 && games.filter((game) => game.flags.isNewHome).length <= 8, "New count must be 6-8");
add(games.filter((game) => game.flags.isRecommendedHome).length === 6, "Recommended count must be six");

for (const { file, value: guide } of guides) {
  exactKeys(guide,["id","slug","status","title","author","summary","tags","publishedAt","updatedAt","cover","seo","sections","relatedGuideIds"],`guide ${file}`);
  add(typeof guide.author === "string" && guide.author.trim().length > 0, `${file}: author is required`);
  add(file === `${guide.slug}.json`, `${file}: filename must match slug`);
  add(slug.test(guide.id) && slug.test(guide.slug), `${file}: invalid ID or slug`);
  for (const id of guide.relatedGuideIds) add(guides.some(({ value }) => value.id === id), `${file}: missing related Guide ${id}`);
  if (!guide.cover.src) warnings.push(`${guide.id}: cover pending Flow 08`);
  if (!guide.sections.length) warnings.push(`${guide.id}: content pending Flow 07`);
}
add(new Set(guides.map(({value}) => value.id)).size === guides.length, "duplicate Guide ID");
add(new Set(guides.map(({value}) => value.slug)).size === guides.length, "duplicate Guide slug");

if (["media","prepublish","release"].includes(mode)) {
  for (const game of allGames) add(Boolean(game.image.src && game.image.alt && game.image.width && game.image.height), `${game.id}: complete cover required`);
  for (const { value: guide } of guides) add(Boolean(guide.cover.src && guide.cover.alt && guide.cover.width && guide.cover.height), `${guide.id}: complete cover required`);
}
if (["prepublish","release"].includes(mode)) {
  for (const game of allGames) {
    const text = game.content.flatMap((section) => section.blocks).filter((block) => ["paragraph","list","steps","callout","table","faq"].includes(block.type)).map((block) => JSON.stringify(block)).join("").replace(/\s/g, "");
    add(text.length >= 4000, `${game.id}: article under 4000 non-whitespace characters`);
    add(game.seo.title.length >= 40 && game.seo.title.length <= 60, `${game.id}: SEO title length`);
    add(game.seo.description.length >= 140 && game.seo.description.length <= 160, `${game.id}: SEO description length`);
  }
}
if (mode === "release") {
  add(main.status === "published", "main game must be published");
  add(games.filter((game) => game.status === "published").length >= 8, "at least eight additions must be published");
  add(guides.filter(({value}) => value.status === "published").length >= 2, "at least two Guides must be published");
  for (const game of allGames) add(game.status === "published" && game.publishedAt && game.updatedAt, `${game.id}: published status and dates required`);
  for (const { value: guide } of guides) add(guide.status === "published" && guide.publishedAt && guide.updatedAt, `${guide.id}: published status and dates required`);
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) { for (const error of errors) console.error(`ERROR ${error}`); process.exit(1); }
console.log(`Content validation passed in ${mode} mode: ${allGames.length} games, ${guides.length} Guides.`);
