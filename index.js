const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GO_SERVICE_URL  = process.env.GO_SERVICE_URL  || 'http://localhost:8081';
const JAVA_SERVICE_URL = process.env.JAVA_SERVICE_URL || 'http://localhost:8080';

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'nodejs-frontend' }));

// Legacy route kept for existing tests
app.get('/add/:a/:b', (req, res) =>
  res.json({ result: Number(req.params.a) + Number(req.params.b) }));

// ── Service health aggregator ─────────────────────────────────────────────────
app.get('/api/services/health', async (req, res) => {
  const [go, java] = await Promise.allSettled([
    fetch(`${GO_SERVICE_URL}/health`).then(r => r.json()),
    fetch(`${JAVA_SERVICE_URL}/actuator/health`).then(r => r.json()),
  ]);
  res.json({
    nodejs: { status: 'ok' },
    go:   go.status   === 'fulfilled' ? go.value   : { status: 'down' },
    java: java.status === 'fulfilled' ? java.value : { status: 'down' },
  });
});

// ── Go catalog ────────────────────────────────────────────────────────────────
app.get('/api/catalog', async (req, res) => {
  try {
    const r = await fetch(`${GO_SERVICE_URL}/products`);
    res.status(r.status).json(await r.json());
  } catch {
    res.status(502).json({ error: 'Go catalog service unavailable' });
  }
});

// ── Java inventory ────────────────────────────────────────────────────────────
app.get('/api/inventory/products', async (req, res) => {
  try {
    const r = await fetch(`${JAVA_SERVICE_URL}/api/v1/products`);
    res.status(r.status).json(await r.json());
  } catch {
    res.status(502).json({ error: 'Java inventory service unavailable' });
  }
});

app.get('/api/inventory/orders', async (req, res) => {
  try {
    const r = await fetch(`${JAVA_SERVICE_URL}/api/v1/orders`);
    res.status(r.status).json(await r.json());
  } catch {
    res.status(502).json({ error: 'Java inventory service unavailable' });
  }
});

app.post('/api/inventory/orders', async (req, res) => {
  try {
    const r = await fetch(`${JAVA_SERVICE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    res.status(r.status).json(await r.json());
  } catch {
    res.status(502).json({ error: 'Java inventory service unavailable' });
  }
});

// ── Frontend ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  app.listen(3000, () => console.log('Frontend listening on :3000'));
}

module.exports = app;
