import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
const games=JSON.parse(fs.readFileSync("data/games/games.json","utf8"));
const wanted=new Set(["animal-quiz","sweet-hangman","text-twist-2","word-bird","word-detector","word-search-classic"]);
const browser=await chromium.launch({headless:true});
for(const game of games.filter(g=>wanted.has(g.id))){
 const page=await browser.newPage({viewport:{width:1280,height:720}}); const dir=path.resolve("public/images/games",game.slug);
 const shot=(n)=>page.screenshot({path:path.join(dir,n),type:"webp",quality:84});
 const accept=async()=>{const b=page.getByText("Accept All Cookies",{exact:true}).first();if(await b.isVisible().catch(()=>false)){await b.click();await page.waitForTimeout(1800)}};
 await page.goto(game.player.iframeSrc,{waitUntil:"domcontentloaded",timeout:45000}); await page.waitForTimeout(6000); await accept(); await page.mouse.click(640,390); await page.waitForTimeout(4000); await accept(); await page.mouse.click(640,390); await page.waitForTimeout(9000);
 if(["animal-quiz","word-search-classic"].includes(game.id)){await page.mouse.click(1240,20);await page.waitForTimeout(9000);await page.mouse.click(1240,20);await page.waitForTimeout(4000)}
 await shot("cover.webp");
 const start={"animal-quiz":[640,610],"sweet-hangman":[640,625],"text-twist-2":[545,690],"word-bird":[640,455],"word-detector":[640,475],"word-search-classic":[640,610]}[game.id];
 await page.mouse.click(...start);await page.waitForTimeout(5000);await shot("gameplay-1.webp");
 if(game.id==="sweet-hangman"){await page.mouse.click(480,650);}
 else if(game.id==="text-twist-2"){await page.keyboard.type("cat").catch(()=>{});await page.keyboard.press("Enter").catch(()=>{});await page.mouse.click(480,600);}
 else if(game.id==="animal-quiz"){await page.mouse.click(480,650);}
 else {await page.mouse.move(480,520);await page.mouse.down();await page.mouse.move(620,500,{steps:10});await page.mouse.up();}
 await page.waitForTimeout(2200);await shot("gameplay-2.webp");
 await page.mouse.click(760,620);await page.waitForTimeout(2200);await shot("gameplay-3.webp");
 await page.close();
}
await browser.close();
