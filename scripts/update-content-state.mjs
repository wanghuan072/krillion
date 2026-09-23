import crypto from "node:crypto";
import fs from "node:fs";
import tdk from "../seo/tdk.js";

const canonical=(value)=>Array.isArray(value)?value.map(canonical):value&&typeof value==="object"?Object.fromEntries(Object.keys(value).sort().map((key)=>[key,canonical(value[key])])):value;
const hash=(value)=>crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const previous=JSON.parse(fs.readFileSync("seo/page-lastmod.json","utf8"));
const today=new Date().toISOString().slice(0,10);
const main=JSON.parse(fs.readFileSync("data/games/main-game.json","utf8"));
const games=JSON.parse(fs.readFileSync("data/games/games.json","utf8")).filter((game)=>game.status==="published");
const guides=fs.readdirSync("data/guides").filter((file)=>file.endsWith(".json")).map((file)=>JSON.parse(fs.readFileSync(`data/guides/${file}`,"utf8"))).filter((guide)=>guide.status==="published");
const legalSource=fs.readFileSync("src/page/legal/LegalPages.tsx","utf8");
const reviewSource=fs.readFileSync("src/components/game/GameReviews.tsx","utf8");
const socialImageFingerprint=hash(fs.readFileSync("public/images/og-image.png").toString("base64"));
const sharedSeoSource=["src/seo/metadata.ts","src/seo/structured-data.ts","src/config/site.ts","app/layout.tsx"].map((file)=>fs.readFileSync(file,"utf8")).join("\n")+socialImageFingerprint;
const gamePageSource=fs.readFileSync("src/components/game/GamePageShell.tsx","utf8");
const guidePageSource=fs.readFileSync("src/components/guides/GuideViews.tsx","utf8");
const gamesIndexSource=fs.readFileSync("app/games/page.tsx","utf8");
const guidesIndexSource=fs.readFileSync("app/guides/page.tsx","utf8");

const retain=(record,fingerprint,{legacy=[]}={})=>({
  fingerprint,
  lastModified:record&&[fingerprint,...legacy].includes(record.fingerprint)?record.lastModified??record.updatedAt??today:today,
});
const legalShared=legalSource.slice(0,legalSource.indexOf("export function PrivacyPage"));
const legalSection=(name)=>{
  const start=legalSource.indexOf(`export function ${name}`);
  const next=legalSource.indexOf("\nexport function ",start+1);
  if(start<0)throw new Error(`Missing legal page component ${name}`);
  return legalSource.slice(start,next<0?legalSource.length:next);
};

const staticInputs={
  "/":{value:{main,homeCards:games.map((game)=>({id:game.id,title:game.title,shortDescription:game.shortDescription,image:game.image,publishedAt:game.publishedAt,flags:game.flags})),reviewSource,sharedSeoSource,gamePageSource},pageId:"home"},
  "/games":{value:{tdk:tdk["games-index"],cards:games.map((game)=>({id:game.id,title:game.title,shortDescription:game.shortDescription,image:game.image,publishedAt:game.publishedAt})),sharedSeoSource,gamesIndexSource},pageId:"games-index"},
  "/guides":{value:{tdk:tdk["guides-index"],cards:guides.map((guide)=>({id:guide.id,title:guide.title,summary:guide.summary,cover:guide.cover})),sharedSeoSource,guidesIndexSource},pageId:"guides-index"},
  "/privacy":{value:{tdk:tdk.privacy,shared:legalShared,page:legalSection("PrivacyPage"),sharedSeoSource},pageId:"privacy",legacy:hash({tdk:tdk.privacy,legalSource})},
  "/terms":{value:{tdk:tdk.terms,shared:legalShared,page:legalSection("TermsPage"),sharedSeoSource},pageId:"terms",legacy:hash({tdk:tdk.terms,legalSource})},
  "/copyright":{value:{tdk:tdk.copyright,shared:legalShared,page:legalSection("CopyrightPage"),sharedSeoSource},pageId:"copyright",legacy:hash({tdk:tdk.copyright,legalSource})},
  "/about":{value:{tdk:tdk.about,shared:legalShared,page:legalSection("AboutPage"),sharedSeoSource},pageId:"about",legacy:hash({tdk:tdk.about,legalSource})},
  "/contact":{value:{tdk:tdk.contact,shared:legalShared,page:legalSection("ContactPage"),sharedSeoSource},pageId:"contact",legacy:hash({tdk:tdk.contact,legalSource})},
};

const staticPages=Object.fromEntries(Object.entries(staticInputs).map(([path,input])=>{
  const fingerprint=hash(input.value);
  return [path,{pageId:input.pageId,...retain(previous.staticPages?.[path],fingerprint,{legacy:input.legacy?[input.legacy]:[]})}];
}));

const gameState=Object.fromEntries(games.map((game)=>{
  const legacy=hash({player:game.player,seo:game.seo,image:game.image,content:game.content,relatedGameIds:game.relatedGameIds,flags:game.flags,reviewSource});
  const fingerprint=hash({title:game.title,shortDescription:game.shortDescription,categories:game.categories,tags:game.tags,player:game.player,seo:game.seo,image:game.image,content:game.content,relatedGameIds:game.relatedGameIds,flags:game.flags,reviewSource,sharedSeoSource,gamePageSource});
  return [game.id,{slug:game.slug,...retain(previous.games?.[game.id],fingerprint,{legacy:[legacy]})}];
}));

const guideState=Object.fromEntries(guides.map((guide)=>{
  const legacy=hash({title:guide.title,summary:guide.summary,seo:guide.seo,cover:guide.cover,sections:guide.sections,relatedGuideIds:guide.relatedGuideIds});
  const fingerprint=hash({title:guide.title,author:guide.author,summary:guide.summary,tags:guide.tags,seo:guide.seo,cover:guide.cover,sections:guide.sections,relatedGuideIds:guide.relatedGuideIds,sharedSeoSource,guidePageSource});
  return [guide.id,{slug:guide.slug,...retain(previous.guides?.[guide.id],fingerprint,{legacy:[legacy]})}];
}));

fs.writeFileSync("seo/page-lastmod.json",`${JSON.stringify({schemaVersion:2,staticPages,games:gameState,guides:guideState},null,2)}\n`);
console.log("Updated sitemap fingerprints; unchanged page dates were preserved.");
