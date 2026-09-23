import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const main = JSON.parse(fs.readFileSync("data/games/main-game.json","utf8"));
const games = JSON.parse(fs.readFileSync("data/games/games.json","utf8"));
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
