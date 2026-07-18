// Servidor estático do site SAFEBOAT — porta 8099
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const PORTA = 8099;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let alvo = decodeURIComponent(req.url.split("?")[0]);
    if (alvo === "/") alvo = "/index.html";
    const arquivo = path.join(RAIZ, alvo);
    if (!arquivo.startsWith(RAIZ) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
      res.writeHead(404);
      return res.end("404");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(arquivo).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(arquivo).pipe(res);
  })
  .listen(PORTA, () => console.log(`SAFEBOAT site em http://localhost:${PORTA}`));
