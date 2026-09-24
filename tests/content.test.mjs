import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const main = JSON.parse(fs.readFileSync("data/games/main-game.json","utf8"));
const games = JSON.parse(fs.readFileSync("data/games/games.json","utf8"));
const guides = fs.readdirSync("data/guides").filter((file)=>file.endsWith(".json")).map((file)=>JSON.parse(fs.readFileSync(`data/guides/${file}`,"utf8"))).filter((guide)=>guide.status==="published");
const lastmod = JSON.parse(fs.readFileSync("seo/page-lastmod.json","utf8"));
const tdk = (await import("../seo/tdk.js")).default;
test("responsive CSS uses only the 1024 and 768 width breakpoints",()=>{
  const css=["src/style/globals.css","src/style/site.module.css","app/globals.css"].map((file)=>fs.readFileSync(file,"utf8")).join("\n");
  const breakpoints=[...css.matchAll(/@media\s*\(\s*(?:min|max)-width\s*:\s*(\d+)px\s*\)/g)].map((match)=>Number(match[1]));
  assert.deepEqual([...new Set(breakpoints)].sort((a,b)=>a-b),[768,1024]);
});
test("the supplied main iframe is preserved",()=>assert.equal(main.player.iframeSrc,"https://www.krillion.org/play/daily/"));
test("eight stable additional games exist",()=>assert.equal(games.length,8));
test("home flags are 8 featured, 8 new, 6 recommended",()=>{assert.equal(games.filter((game)=>game.flags.isFeaturedHome).length,8);assert.equal(games.filter((game)=>game.flags.isNewHome).length,8);assert.equal(games.filter((game)=>game.flags.isRecommendedHome).length,6);});
test("every additional game has six non-self relations",()=>games.forEach((game)=>{assert.equal(game.relatedGameIds.length,6);assert.ok(!game.relatedGameIds.includes(game.id));}));
test("every game sandbox blocks popups and top navigation",()=>[main,...games].forEach((game)=>{assert.ok(game.player.sandbox.includes("allow-scripts"));for(const token of ["allow-popups","allow-popups-to-escape-sandbox","allow-top-navigation","allow-top-navigation-by-user-activation"])assert.ok(!game.player.sandbox.includes(token),`${game.id} must not include ${token}`);}));
const expectedPlayers=new Map([
  ["wordle-game","https://azgames.io/game/wordlegame/"],
  ["letter-boxed","https://azgames.io/game/letter-boxed/?mode=unlimited"],
  ["growdle","https://azgames.io/game/__dgame/growdle/"],
  ["quardle","https://azgames.io/game/quardle/"],
  ["waffle","https://azgames.io/game/wafflegame/"],
  ["fun-typing-io","https://azgames.io/fun-typing-io.embed"],
  ["spelling-bee","https://azgames.io/game/bee/"],
  ["cheat-or-repeat","https://azgames.io/cheat-or-repeat.embed"],
]);
test("the fixed catalog and its sole player URLs are preserved",()=>{
  assert.deepEqual(games.map((game)=>game.id),[...expectedPlayers.keys()]);
  games.forEach((game)=>assert.equal(game.player.iframeSrc,expectedPlayers.get(game.id)));
});
test("every addition has three gameplay images and one final video",()=>games.forEach((game)=>{
  const blocks=game.content.flatMap((section)=>section.blocks);
  const visibleText=blocks.filter((block)=>["paragraph","list","steps","callout","table","faq"].includes(block.type)).map((block)=>JSON.stringify(block)).join("").replace(/\s/g,"");
  assert.ok(visibleText.length>=8000,`${game.id} should contain a substantial guide`);
  assert.equal(blocks.filter((block)=>block.type==="image").length,3);
  assert.equal(blocks.filter((block)=>block.type==="video").length,1);
  assert.ok(game.content.at(-1).blocks.some((block)=>block.type==="video"));
}));
test("sitemap state covers every published route with stable fingerprints",()=>{
  assert.deepEqual(Object.keys(lastmod.staticPages),["/","/games","/guides","/privacy","/terms","/copyright","/about","/contact"]);
  assert.deepEqual(Object.keys(lastmod.games),games.filter((game)=>game.status==="published").map((game)=>game.id));
  assert.deepEqual(Object.keys(lastmod.guides),guides.map((guide)=>guide.id));
  for(const record of [...Object.values(lastmod.staticPages),...Object.values(lastmod.games),...Object.values(lastmod.guides)]){
    assert.match(record.fingerprint,/^[a-f0-9]{64}$/);
    assert.match(record.lastModified,/^\d{4}-\d{2}-\d{2}$/);
  }
});
test("Games index TDK targets the Games Like Krillion long-tail keyword",()=>{
  const metadata=tdk["games-index"];
  assert.match(metadata.title,/Games Like Krillion/i);
  assert.match(metadata.description,/games like Krillion/i);
  assert.ok(metadata.title.length>=40&&metadata.title.length<=60);
  assert.ok(metadata.description.length>=140&&metadata.description.length<=160);
  assert.ok(metadata.keywords.includes("games like Krillion"));
});
test("the shared social image is a 1200 by 630 PNG",()=>{
  const image=fs.readFileSync("public/images/og-image.png");
  assert.equal(image.toString("hex",0,8),"89504e470d0a1a0a");
  assert.equal(image.readUInt32BE(16),1200);
  assert.equal(image.readUInt32BE(20),630);
});
test("the favicon contains common browser icon sizes",()=>{
  const icon=fs.readFileSync("public/favicon.ico");
  assert.equal(icon.readUInt16LE(0),0);
  assert.equal(icon.readUInt16LE(2),1);
  const count=icon.readUInt16LE(4);
  const sizes=Array.from({length:count},(_,index)=>{
    const offset=6+index*16;
    return [icon[offset]||256,icon[offset+1]||256];
  });
  assert.deepEqual(sizes,[[16,16],[32,32],[48,48]]);
  assert.ok(icon.length<5000,"favicon should stay below 5 KB");
  for(const file of ["app/favicon.ico","app/icon.png","app/apple-icon.png"]){
    assert.equal(fs.existsSync(file),false,`${file} would add duplicate metadata icon requests`);
  }
});
test("the header logo is right-sized for its rendered dimensions",()=>{
  const logo=fs.readFileSync("public/images/logo.png");
  assert.equal(logo.readUInt32BE(16),96);
  assert.equal(logo.readUInt32BE(20),96);
  assert.ok(logo.length<8000,"header logo should stay below 8 KB");
});
test("framework starter icons are not shipped",()=>{
  for(const file of ["file.svg","globe.svg","next.svg","vercel.svg","window.svg"]){
    assert.equal(fs.existsSync(`public/${file}`),false,`${file} should not be present`);
  }
});
test("the player-facing README links every navigation page",()=>{
  const readme=fs.readFileSync("README.md","utf8");
  for(const path of ["/","/guides","/games","/privacy","/terms","/copyright","/about","/contact"]){
    const url=`https://krilliongames.com${path}`;
    assert.ok(readme.includes(`](${url})`),`README should link ${url}`);
  }
  assert.doesNotMatch(readme,/project structure|directory structure|src\/|app\//i);
});
