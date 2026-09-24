import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const main = JSON.parse(fs.readFileSync("data/games/main-game.json","utf8"));
const games = JSON.parse(fs.readFileSync("data/games/games.json","utf8"));
const guides = fs.readdirSync("data/guides").filter((file)=>file.endsWith(".json")).map((file)=>JSON.parse(fs.readFileSync(`data/guides/${file}`,"utf8"))).filter((guide)=>guide.status==="published");
const lastmod = JSON.parse(fs.readFileSync("seo/page-lastmod.json","utf8"));
const tdk = (await import("../seo/tdk.js")).default;
const visibleBlockText=(block)=>{
  if(block.type==="paragraph"||block.type==="subheading")return block.text;
  if(block.type==="image")return `${block.alt??""} ${block.caption??""}`;
  if(block.type==="list")return block.items.join(" ");
  if(block.type==="steps")return block.items.flatMap((item)=>[item.title,item.body]).join(" ");
  if(block.type==="callout")return `${block.label??""} ${block.body}`;
  if(block.type==="table")return [...block.columns,...block.rows.flat()].join(" ");
  if(block.type==="faq")return block.items.flatMap((item)=>[item.question,item.answer]).join(" ");
  return "";
};
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
test("every addition has a distinct long-form article and one analyzed video",()=>{
  const signatures=[];
  const proseOwners=new Map();
  games.forEach((game)=>{
  const blocks=game.content.flatMap((section)=>section.blocks);
  const visibleText=[game.page.intro,...game.content.flatMap((section)=>[section.heading,...section.blocks.filter((block)=>block.type!=="video").map(visibleBlockText)])].join(" ").replace(/\s/g,"");
  assert.ok(visibleText.length>=8000,`${game.id} should contain a substantial guide`);
  assert.ok(blocks.filter((block)=>block.type==="image").length>=3);
  assert.equal(blocks.filter((block)=>block.type==="video").length,1);
  assert.ok(game.content.at(-1).blocks.some((block)=>block.type==="video"));
  assert.ok(game.content.length>=6&&game.content.length<=9);
  assert.ok(blocks.some((block)=>block.type==="subheading"));
  const video=blocks.find((block)=>block.type==="video");
  assert.ok(video.summary&&video.segments.length>=3&&video.takeaways.length>=3&&video.versionNote);
  assert.ok(game.page.h1.toLowerCase().includes(game.title.toLowerCase()));
  assert.ok(game.content[0].heading.toLowerCase().includes(game.title.toLowerCase()));
  assert.ok(game.content.some((section)=>/strategy/i.test(section.heading)&&section.heading.toLowerCase().includes(game.title.toLowerCase())));
  assert.ok(game.content.some((section)=>/faq/i.test(section.heading)&&section.heading.toLowerCase().includes(game.title.toLowerCase())));
  assert.ok(game.page.videoHeading.toLowerCase().includes(game.title.toLowerCase()));
  signatures.push(game.content.map((section)=>section.blocks.map((block)=>block.type).join("-")).join("|"));
  for(const block of blocks){const value=visibleBlockText(block).replace(/\s+/g," ").trim();if(value.length<120)continue;assert.ok(!proseOwners.has(value),`${game.id} repeats long prose from ${proseOwners.get(value)}`);proseOwners.set(value,game.id);}
  });
  assert.equal(new Set(signatures).size,games.length);
});
test("Guides have distinct long-form structures, exact media plans, and valid scoring data",()=>{
  const signatures=[];
  const videoIds=new Map([
    ["krillion-how-to-play","a899LxaHSsA"],
    ["krillion-scoring-rare-answers","SsZZbOVMm1M"],
    ["krillion-loading-input-help",null],
  ]);
  for(const guide of guides){
    const blocks=guide.sections.flatMap((section)=>section.blocks);
    const text=guide.sections.flatMap((section)=>[section.title,...section.blocks.filter((block)=>block.type!=="video").map(visibleBlockText)]).join(" ").replace(/\s/g,"");
    const images=blocks.filter((block)=>block.type==="image");
    const videos=blocks.filter((block)=>block.type==="video");
    assert.ok(text.length>=6000,`${guide.id} should contain at least 6000 visible non-whitespace characters`);
    assert.equal(images.length,3);
    assert.ok(blocks.filter((block)=>block.type==="subheading").length>=2);
    assert.ok(blocks.filter((block)=>block.type==="faq").flatMap((block)=>block.items).length>=5);
    assert.equal(videos.length,videoIds.get(guide.id)?1:0);
    assert.equal(videos[0]?.videoId??null,videoIds.get(guide.id));
    assert.equal(guide.author,"Checkpoint Nomad");
    assert.ok(guide.seo.title.length>=40&&guide.seo.title.length<=60);
    assert.ok(guide.seo.description.length>=140&&guide.seo.description.length<=160);
    assert.ok(guide.seo.keywords.length>=3);
    signatures.push(guide.sections.map((section)=>section.blocks.map((block)=>block.type).join("-")).join("|"));
  }
  assert.equal(new Set(signatures).size,guides.length);
  const scoring=guides.find((guide)=>guide.id==="krillion-scoring-rare-answers");
  const scoringText=JSON.stringify(scoring);
  for(const value of [10,15,30,60,85,100])assert.match(scoringText,new RegExp(`"${value}"`));
  assert.match(scoringText,/700/);
  assert.match(scoringText,/7,000 m/);
  assert.match(scoringText,/multiplied by ten/i);
});
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
