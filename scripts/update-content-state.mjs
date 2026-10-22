import fs from "node:fs";
import { prepareSiteState } from "../seo/site-registry.mjs";
const file = "seo/page-lastmod.json";
const previous = JSON.parse(fs.readFileSync(file, "utf8"));
fs.writeFileSync(file, `${JSON.stringify(prepareSiteState(previous), null, 2)}\n`);
console.log("Prepared public routes; existing dates retained until rendered-content verification.");
