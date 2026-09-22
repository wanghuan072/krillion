import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2] ?? "out");
const port = Number(process.env.PORT ?? 4173);
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".xml":"application/xml",".png":"image/png",".webp":"image/webp",".ico":"image/x-icon"};
http.createServer((req,res) => { const pathname = decodeURIComponent(new URL(req.url ?? "/","http://local").pathname); const candidates = pathname === "/" ? ["index.html"] : [pathname.slice(1), `${pathname.slice(1)}.html`, path.join(pathname.slice(1),"index.html")]; const file = candidates.map((item) => path.resolve(root,item)).find((item) => item.startsWith(root) && fs.existsSync(item) && fs.statSync(item).isFile()); if (!file) { res.writeHead(404,{"content-type":"text/html"}); res.end(fs.readFileSync(path.join(root,"404.html"))); return; } res.writeHead(200,{"content-type":mime[path.extname(file)] ?? "application/octet-stream"}); fs.createReadStream(file).pipe(res); }).listen(port,"127.0.0.1",()=>console.log(`Static preview http://127.0.0.1:${port}`));
