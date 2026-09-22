import fs from "node:fs";
const required = ["out/index.html","out/games.html","out/guides.html","out/sitemap.xml","out/robots.txt","out/_headers"];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error(`Missing static outputs: ${missing.join(", ")}`); process.exit(1); }
const headers = fs.readFileSync("out/_headers","utf8");
if (headers.includes("unsafe-eval")) { console.error("Production CSP contains unsafe-eval"); process.exit(1); }
console.log("Static output audit passed.");
