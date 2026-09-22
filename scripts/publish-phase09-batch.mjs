import fs from "node:fs";
const today="2026-09-21";
const main=JSON.parse(fs.readFileSync("data/games/main-game.json","utf8"));const games=JSON.parse(fs.readFileSync("data/games/games.json","utf8"));
for(const game of [main,...games]){game.status="published";game.publishedAt=game.publishedAt??today;game.updatedAt=today}
fs.writeFileSync("data/games/main-game.json",`${JSON.stringify(main,null,2)}\n`);fs.writeFileSync("data/games/games.json",`${JSON.stringify(games,null,2)}\n`);
for(const file of fs.readdirSync("data/guides").filter(f=>f.endsWith(".json"))){const p=`data/guides/${file}`,g=JSON.parse(fs.readFileSync(p,"utf8"));g.status="published";g.publishedAt=g.publishedAt??today;g.updatedAt=today;fs.writeFileSync(p,`${JSON.stringify(g,null,2)}\n`)}
