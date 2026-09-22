import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createBrotliCompress, createGzip, constants as zlibConstants } from "node:zlib";

const root = path.resolve(process.argv[2] ?? "out");
const port = Number(process.env.PORT ?? 4173);
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml",
};
const compressible = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".xml"]);

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://local").pathname);
  const candidates = pathname === "/" ? ["index.html"] : [pathname.slice(1), `${pathname.slice(1)}.html`, path.join(pathname.slice(1), "index.html")];
  const file = candidates.map((item) => path.resolve(root, item)).find((item) => item.startsWith(root) && fs.existsSync(item) && fs.statSync(item).isFile());
  if (!file) {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(path.join(root, "404.html")));
    return;
  }

  const extension = path.extname(file);
  const headers = {
    "cache-control": pathname.startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
    "content-type": mime[extension] ?? "application/octet-stream",
  };
  const accepted = req.headers["accept-encoding"] ?? "";
  const source = fs.createReadStream(file);
  if (compressible.has(extension) && accepted.includes("br")) {
    res.writeHead(200, { ...headers, "content-encoding": "br", vary: "Accept-Encoding" });
    source.pipe(createBrotliCompress({ params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } })).pipe(res);
    return;
  }
  if (compressible.has(extension) && accepted.includes("gzip")) {
    res.writeHead(200, { ...headers, "content-encoding": "gzip", vary: "Accept-Encoding" });
    source.pipe(createGzip({ level: 6 })).pipe(res);
    return;
  }
  res.writeHead(200, headers);
  source.pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`Static preview http://127.0.0.1:${port}`));
