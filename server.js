/**
 * نور السنة — Railway Server
 * Serves public/ AND proxies /v1/* to upstream API
 * Railway auto-injects PORT env variable.
 */

const express  = require('express');
const http     = require('http');
const path     = require('path');

const app         = express();
const PORT        = process.env.PORT || 3000;
const TARGET_HOST = new URL(process.env.API_BASE).hostname;
const TARGET_PORT = 80;

// ── Static files (css, js, html, images…) ──────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Proxy: /v1/* → upstream API ────────────────────────────
app.get('/v1/*', (req, res) => {
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

  proxy.on('error', (err) => {
    res.status(502).json({ error: 'Proxy error', detail: err.message });
  });

  req.pipe(proxy);
});

// ── SPA fallback → index.html ───────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  نور السنة on port ${PORT}`);
  console.log(`    API proxy → http://${TARGET_HOST}`);
});
