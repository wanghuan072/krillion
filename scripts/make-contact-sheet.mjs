import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
const root = path.resolve("public/images/games");
const selected = process.argv.slice(2);
const rows = fs.readdirSync(root).filter((name) => fs.statSync(path.join(root, name)).isDirectory() && (!selected.length || selected.includes(name))).sort();
const encode = (file) => `data:image/webp;base64,${fs.readFileSync(file).toString("base64")}`;
const html = `<!doctype html><style>body{margin:0;background:#07131f;color:white;font:16px Arial}.row{display:grid;grid-template-columns:140px repeat(4,1fr);align-items:center;border-bottom:2px solid #173653}.name{padding:12px}.cell{position:relative}.cell img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.cell span{position:absolute;left:6px;bottom:5px;background:#000a;padding:3px 6px;font-size:12px}</style>${rows.map((name)=>{const cover=fs.readdirSync(path.join(root,name)).find((file)=>/^cover\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file));return `<div class="row"><div class="name">${name}</div>${[cover,"gameplay-1.webp","gameplay-2.webp","gameplay-3.webp"].map((file)=>`<div class="cell"><img src="${encode(path.join(root,name,file))}"><span>${file}</span></div>`).join("")}</div>`}).join("")}`;
const browser=await chromium.launch({headless:true}); const page=await browser.newPage({viewport:{width:1280,height:1800}}); await page.setContent(html,{waitUntil:"load"}); await page.screenshot({path:"reports/phase08-contact-sheet.png",fullPage:true}); await browser.close();
