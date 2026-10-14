// Minimal static file server for public/ used by the browser checks.
// Serves directory indexes and falls back to /404.html like GitHub Pages.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function start(root, port = 0) {
  root = path.resolve(root);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(root, p);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    let status = 200;
    if (!fs.existsSync(file)) { file = path.join(root, "404.html"); status = 404; }
    res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () =>
    resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

module.exports = { start };
