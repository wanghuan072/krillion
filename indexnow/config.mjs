import fs from "node:fs";

const siteConfigSource = fs.readFileSync(new URL("../src/config/site.ts", import.meta.url), "utf8");
const originMatch = siteConfigSource.match(/origin:\s*"([^"]+)"/);

if (!originMatch) {
  throw new Error("IndexNow could not read the canonical origin from src/config/site.ts.");
}

export const siteOrigin = new URL(originMatch[1]).origin;
export const siteHost = new URL(siteOrigin).host;
export const indexNowKey = "edfebcf39a9d3db64a9d65180fca9190";
export const indexNowKeyFile = `${indexNowKey}.txt`;
export const indexNowKeyLocation = `${siteOrigin}/${indexNowKeyFile}`;
export const indexNowEndpoint = "https://api.indexnow.org/indexnow";

