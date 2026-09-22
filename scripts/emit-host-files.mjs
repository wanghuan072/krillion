import fs from "node:fs";
import path from "node:path";
const main = JSON.parse(fs.readFileSync("data/games/main-game.json","utf8"));
const games = JSON.parse(fs.readFileSync("data/games/games.json","utf8")).filter((game) => game.status === "published");
const origins = [...new Set([main,...games].flatMap((game) => { try { const url = new URL(game.player.iframeSrc); if (url.protocol !== "https:") return []; const values=[url.origin]; if(url.hostname==="play.famobi.com") values.push("https://games.cdn.famobi.com"); const placementDomain=url.searchParams.get("fg_domain"); if(placementDomain&&/^[a-z0-9.-]+$/i.test(placementDomain)) values.push(`https://${placementDomain}`); return values; } catch { return []; } }))].sort();
const csp = `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-src 'self' ${origins.join(" ")} https://www.youtube-nocookie.com; connect-src 'self' https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
fs.writeFileSync("out/_headers", `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`);

// Next's Windows static exporter can materialize route-segment RSC payloads as
// nested directories even though the generated client requests their dotted
// URL aliases. Emit the aliases so the output behaves identically on a plain
// static host and in the local production preview.
let rscAliases = 0;
function emitRscAliases(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    if (entry.name.startsWith("__next.")) {
      const pending = [child];
      while (pending.length) {
        const candidate = pending.pop();
        for (const nested of fs.readdirSync(candidate, { withFileTypes: true })) {
          const nestedPath = path.join(candidate, nested.name);
          if (nested.isDirectory()) pending.push(nestedPath);
          if (nested.isFile() && nested.name === "__PAGE__.txt") {
            const relative = path.relative(directory, nestedPath);
            const alias = relative.split(path.sep).join(".");
            fs.copyFileSync(nestedPath, path.join(directory, alias));
            rscAliases += 1;
          }
        }
      }
    }
    emitRscAliases(child);
  }
}
emitRscAliases("out");

console.log(`Emitted out/_headers and ${rscAliases} Windows RSC compatibility aliases.`);
