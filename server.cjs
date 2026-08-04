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
    if (alvo.endsWith("/")) alvo += "index.html";   // igual ao GitHub Pages: /pasta/ -> /pasta/index.html
    let arquivo = path.join(RAIZ, alvo);
    if (!arquivo.startsWith(RAIZ)) {
      res.writeHead(403);
      return res.end("403");
    }
    if (!fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
      // rota sem arquivo: serve o 404.html (que encaminha /proposta/<nº-token>)
      const pagina404 = path.join(RAIZ, "404.html");
      if (!fs.existsSync(pagina404)) {
        res.writeHead(404);
        return res.end("404");
      }
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return fs.createReadStream(pagina404).pipe(res);
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(arquivo).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(arquivo).pipe(res);
  })
  .listen(PORTA, () => console.log(`SAFEBOAT site em http://localhost:${PORTA}`));
