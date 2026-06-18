const fs = require("fs");
const http = require("http");
const path = require("path");

const WEB_ROOT = path.resolve(__dirname, "..", "dist-web");
const INDEX_FILE = path.join(WEB_ROOT, "index.html");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  fs.createReadStream(filePath)
    .on("error", () => {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Server error");
    })
    .once("open", () => {
      res.writeHead(200, { "content-type": contentType });
    })
    .pipe(res);
}

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(WEB_ROOT, normalized);

  if (!filePath.startsWith(WEB_ROOT)) {
    return null;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  return INDEX_FILE;
}

if (!fs.existsSync(INDEX_FILE)) {
  console.error("Missing dist-web/index.html. Run: pnpm run export:web");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  const filePath = resolveRequestPath(url.pathname);

  if (!filePath) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(res, filePath);
});

const port = Number.parseInt(process.env.PORT || "8031", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving Linkit web build on port ${port}`);
});
