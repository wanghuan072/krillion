import crypto from "node:crypto";
import fs from "node:fs";
import tdk from "../seo/tdk.js";
const canonical=(value)=>Array.isArray(value)?value.map(canonical):value&&typeof value==="object"?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const hash=value=>crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const state=JSON.parse(fs.readFileSync("seo/page-lastmod.json","utf8"));const today=new Date().toISOString().slice(0,10);
const games=JSON.parse(fs.readFileSync("data/games/games.json","utf8")).filter(g=>g.status==="published");const guides=fs.readdirSync("data/guides").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(fs.readFileSync(`data/guides/${f}`,"utf8"))).filter(g=>g.status==="published");
const legalSource=fs.readFileSync("src/page/legal/LegalPages.tsx","utf8");
const reviewSource=fs.readFileSync("src/components/game/GameReviews.tsx","utf8");
const pages={"/games":{tdk:tdk["games-index"],cards:games.map(g=>({id:g.id,title:g.title,shortDescription:g.shortDescription,image:g.image,publishedAt:g.publishedAt}))},"/guides":{tdk:tdk["guides-index"],cards:guides.map(g=>({id:g.id,title:g.title,summary:g.summary,cover:g.cover}))},"/privacy":{tdk:tdk.privacy,legalSource},"/terms":{tdk:tdk.terms,legalSource},"/copyright":{tdk:tdk.copyright,legalSource},"/about":{tdk:tdk.about,legalSource},"/contact":{tdk:tdk.contact,legalSource}};
for(const [url,value] of Object.entries(pages)){const fingerprint=hash(value);if(state.staticPages[url]?.fingerprint!==fingerprint)state.staticPages[url]={pageId:url==="/games"?"games-index":url==="/guides"?"guides-index":url.slice(1),fingerprint,lastModified:today}}
state.games=Object.fromEntries(games.map(g=>[g.id,{slug:g.slug,fingerprint:hash({player:g.player,seo:g.seo,image:g.image,content:g.content,relatedGameIds:g.relatedGameIds,flags:g.flags,reviewSource}),updatedAt:g.updatedAt}]));
state.guides=Object.fromEntries(guides.map(g=>[g.id,{slug:g.slug,fingerprint:hash({title:g.title,summary:g.summary,seo:g.seo,cover:g.cover,sections:g.sections,relatedGuideIds:g.relatedGuideIds}),updatedAt:g.updatedAt}]));
fs.writeFileSync("seo/page-lastmod.json",`${JSON.stringify(state,null,2)}\n`);console.log("Updated fingerprints for changed public content only.");
