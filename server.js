/**
 * نور السنة — Railway Server
 * Serves public/index.html AND proxies /v1/* to 98.92.59.173
 * Railway auto-injects PORT env variable.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT        = process.env.PORT || 3000;
const TARGET_HOST = '98.92.30.29';
const TARGET_PORT = 80;

http.createServer((req, res) => {

  // ── CORS preflight ──────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Proxy: /v1/* → upstream API ────────────────────────────
  if (req.url.startsWith('/v1/')) {
    const proxy = http.request(
      { host: TARGET_HOST, port: TARGET_PORT, path: req.url, method: 'GET' },
      (upstream) => {
        const headers = {};
        for (const [k, v] of Object.entries(upstream.headers)) {
          if (k.toLowerCase() !== 'access-control-allow-origin') headers[k] = v;
        }
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Cache-Control'] = 'public, max-age=300';
        res.writeHead(upstream.statusCode, headers);
        upstream.pipe(res);
      }
    );
    proxy.on('error', err => {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }));
    });
    req.pipe(proxy);
    return;
  }

  // ── Static: serve public/index.html for everything else ────
  const filePath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });

}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅  نور السنة on port ${PORT}`);
  console.log(`    API proxy → http://${TARGET_HOST}`);
});
