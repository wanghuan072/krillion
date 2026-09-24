import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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
const validAzGamesPlayer = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "azgames.io" && !url.username && !url.password && !url.hash
      && (url.pathname.startsWith("/game/") || /^\/[a-z0-9-]+\.embed$/.test(url.pathname));
  } catch {
    return false;
  }
};
const visibleBlockText = (block) => {
  if (block.type === "paragraph" || block.type === "subheading") return block.text;
  if (block.type === "image") return `${block.alt ?? ""} ${block.caption ?? ""}`;
  if (block.type === "list") return block.items.join(" ");
  if (block.type === "steps") return block.items.flatMap((item) => [item.title, item.body]).join(" ");
  if (block.type === "callout") return `${block.label ?? ""} ${block.body}`;
  if (block.type === "table") return [...block.columns, ...block.rows.flat()].join(" ");
  if (block.type === "faq") return block.items.flatMap((item) => [item.question, item.answer]).join(" ");
  return "";
};
const articleText = (game) => [game.page?.intro ?? "", ...game.content.flatMap((section) => [section.heading, ...section.blocks.filter((block) => block.type !== "video").map(visibleBlockText)])].join(" ");
const normalizedGameName = (game) => game.title.toLowerCase();

exactKeys(main,["id","slug","title","shortDescription","status","publishedAt","updatedAt","tags","categories","flags","image","player","seo","content","relatedGameIds"],"main game");
add(Array.isArray(games) && games.length >= 8, "games.json must contain at least eight planned additions");
const allGames = [main, ...games];
for (const game of allGames) {
  add(slug.test(game.id) && slug.test(game.slug), `${game.id}: invalid id or slug`);
  exactKeys(game.flags,["isNewHome","isFeaturedHome","isRecommendedHome"],`${game.id}.flags`);
  exactKeys(game.image,["src","alt","width","height"],`${game.id}.image`);
  exactKeys(game.player,["iframeSrc","aspectRatio","orientation","permissionsPolicy","referrerPolicy","sandbox","loadTimeoutMs"],`${game.id}.player`);
  add(typeof game.player.iframeSrc === "string", `${game.id}: iframeSrc must be a string`);
  add(game.id === "krillion" || validAzGamesPlayer(game.player.iframeSrc), `${game.id}: additional iframe must be an approved HTTPS azgames.io /game/ or .embed path`);
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
  exactKeys(guide,["id","slug","status","title","author","summary","tags","publishedAt","updatedAt","cover","seo","videoHeading","sections","relatedGuideIds"],`guide ${file}`);
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
    const text = articleText(game).replace(/\s/g, "");
    const minimumArticleLength = game.id === "krillion" ? 4000 : 8000;
    add(text.length >= minimumArticleLength, `${game.id}: article under ${minimumArticleLength} non-whitespace characters`);
    add(game.seo.title.length >= 40 && game.seo.title.length <= 60, `${game.id}: SEO title length`);
    add(game.seo.description.length >= 140 && game.seo.description.length <= 160, `${game.id}: SEO description length`);
    if (game.id !== "krillion") {
      const images = game.content.flatMap((section) => section.blocks).filter((block) => block.type === "image");
      const videos = game.content.flatMap((section) => section.blocks).filter((block) => block.type === "video");
      const faqItems = game.content.flatMap((section) => section.blocks).filter((block) => block.type === "faq").flatMap((block) => block.items);
      add(Boolean(game.page?.eyebrow && game.page?.h1 && game.page?.intro && game.page?.videoHeading), `${game.id}: complete page copy is required`);
      add(game.content.length >= 6 && game.content.length <= 9, `${game.id}: article must use six to nine purpose-built sections`);
      add(game.content.some((section) => section.blocks.some((block) => block.type === "subheading")), `${game.id}: at least one H3 subheading is required`);
      add(game.page?.h1?.toLowerCase().includes(normalizedGameName(game)), `${game.id}: H1 must include the full game name`);
      add(game.content[0]?.heading?.toLowerCase().includes(normalizedGameName(game)), `${game.id}: first rules H2 must include the full game name`);
      add(game.content.some((section) => /strategy/i.test(section.heading) && section.heading.toLowerCase().includes(normalizedGameName(game))), `${game.id}: strategy H2 must include the full game name`);
      add(game.content.some((section) => /faq/i.test(section.heading) && section.heading.toLowerCase().includes(normalizedGameName(game))), `${game.id}: FAQ H2 must include the full game name`);
      add(game.page?.videoHeading?.toLowerCase().includes(normalizedGameName(game)), `${game.id}: video H2 must include the full game name`);
      add(images.length >= 3, `${game.id}: at least three explanatory gameplay images required`);
      add(videos.length === 1, `${game.id}: exactly one analyzed video is required`);
      add(faqItems.length >= 5 && faqItems.length <= 7, `${game.id}: five to seven game-specific FAQs required`);
      add(videos.every((video) => video.summary && video.segments?.length >= 3 && video.takeaways?.length >= 3 && video.versionNote), `${game.id}: video summary, segments, takeaways, and version note are required`);
      add(game.content.at(-1)?.blocks?.some((block) => block.type === "video"), `${game.id}: videos must follow the article`);
      const hashes = images.map((image) => {
        const file = path.join(root, "public", image.src.replace(/^\//, ""));
        if (!fs.existsSync(file)) return `missing:${image.src}`;
        return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
      });
      add(hashes.every((hash) => !hash.startsWith("missing:")), `${game.id}: gameplay image file missing`);
      add(new Set(hashes).size === images.length, `${game.id}: gameplay images must be distinct`);
    }
  }
  const guideSignatures = [];
  const guideProseOwners = new Map();
  for (const { value: guide } of guides) {
    const blocks = guide.sections.flatMap((section) => section.blocks);
    const text = guide.sections.flatMap((section) => [section.title, ...section.blocks.filter((block) => block.type !== "video").map(visibleBlockText)]).join(" ").replace(/\s/g, "");
    const images = blocks.filter((block) => block.type === "image");
    const videos = blocks.filter((block) => block.type === "video");
    const faqItems = blocks.filter((block) => block.type === "faq").flatMap((block) => block.items);
    const subheadings = blocks.filter((block) => block.type === "subheading");
    add(text.length >= 6000, `${guide.id}: Guide article under 6000 non-whitespace characters`);
    add(guide.seo.title.length >= 40 && guide.seo.title.length <= 60, `${guide.id}: SEO title length`);
    add(guide.seo.description.length >= 140 && guide.seo.description.length <= 160, `${guide.id}: SEO description length`);
    add(Array.isArray(guide.seo.keywords) && guide.seo.keywords.length >= 3, `${guide.id}: natural SEO keywords are required`);
    add(guide.author === "Checkpoint Nomad", `${guide.id}: Guide author must remain Checkpoint Nomad`);
    add(subheadings.length >= 2, `${guide.id}: at least two H3 subheadings are required`);
    add(images.length === 3, `${guide.id}: exactly three inline gameplay images are required`);
    add(faqItems.length >= 5 && faqItems.length <= 7, `${guide.id}: five to seven Guide-specific FAQs required`);
    add(/krillion/i.test(guide.sections[0]?.title ?? ""), `${guide.id}: first core H2 must contain Krillion`);
    add(guide.sections.some((section) => /faq/i.test(section.title) && /krillion/i.test(section.title)), `${guide.id}: FAQ H2 must contain the Guide keyword`);
    const expectedVideoId = guide.id === "krillion-how-to-play" ? "a899LxaHSsA" : guide.id === "krillion-scoring-rare-answers" ? "SsZZbOVMm1M" : null;
    add(videos.length === (expectedVideoId ? 1 : 0), `${guide.id}: unexpected analyzed video count`);
    add(expectedVideoId ? guide.videoHeading?.toLowerCase().includes("krillion") : guide.videoHeading === null, `${guide.id}: video heading does not match the Guide plan`);
    if (expectedVideoId) {
      const video = videos[0];
      add(video?.videoId === expectedVideoId, `${guide.id}: wrong Guide video`);
      add(Boolean(video?.summary && video?.segments?.length >= 3 && video?.takeaways?.length >= 3 && video?.versionNote), `${guide.id}: complete video analysis is required`);
    }
    const imageHashes = images.map((item) => {
      const imageFile = path.join(root, "public", item.src.replace(/^\//, ""));
      if (!fs.existsSync(imageFile)) return `missing:${item.src}`;
      return crypto.createHash("sha256").update(fs.readFileSync(imageFile)).digest("hex");
    });
    const coverFile = path.join(root, "public", guide.cover.src.replace(/^\//, ""));
    const coverHash = fs.existsSync(coverFile) ? crypto.createHash("sha256").update(fs.readFileSync(coverFile)).digest("hex") : "missing-cover";
    add(imageHashes.every((item) => !item.startsWith("missing:")), `${guide.id}: inline image file missing`);
    add(new Set(imageHashes).size === 3, `${guide.id}: inline Guide images must be distinct`);
    add(!imageHashes.includes(coverHash), `${guide.id}: cover must not repeat inside the article`);
    guideSignatures.push(guide.sections.map((section) => section.blocks.map((block) => block.type).join("-")).join("|"));
    for (const block of blocks) {
      const value = visibleBlockText(block).replace(/\s+/g, " ").trim();
      if (value.length < 120) continue;
      const owner = guideProseOwners.get(value);
      add(!owner || owner === guide.id, `${guide.id}: long Guide prose is duplicated from ${owner}`);
      guideProseOwners.set(value, guide.id);
    }
  }
  add(new Set(guideSignatures).size === guides.length, "Guides must not share the same section/block architecture");
  const signatures = games.map((game) => game.content.map((section) => section.blocks.map((block) => block.type).join("-")).join("|"));
  add(new Set(signatures).size === games.length, "additional games must not share the same section/block architecture");
  const proseOwners = new Map();
  for (const game of games) for (const section of game.content) for (const block of section.blocks) {
    const value = visibleBlockText(block).replace(/\s+/g, " ").trim();
    if (value.length < 120) continue;
    const owner = proseOwners.get(value);
    add(!owner || owner === game.id, `${game.id}: long prose is duplicated from ${owner}`);
    proseOwners.set(value, game.id);
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
