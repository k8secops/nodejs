const request = require('supertest');
const app = require('../index');

test('GET / returns index.html', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toMatch(/html/);
});

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
  expect(res.body.service).toBe('nodejs-frontend');
});

test('GET /add/:a/:b returns sum', async () => {
  const res = await request(app).get('/add/2/3');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ result: 5 });
});

test('GET /add handles floats', async () => {
  const res = await request(app).get('/add/1.5/2.5');
  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(4);
});

// Proxy routes — backends likely not running in unit tests
// so we accept 200 (backend up) or 502 (backend down)
test('GET /api/catalog returns 200 or 502', async () => {
  const res = await request(app).get('/api/catalog');
  expect([200, 502]).toContain(res.statusCode);
});

test('GET /api/inventory/products returns 200 or 502', async () => {
  const res = await request(app).get('/api/inventory/products');
  expect([200, 502]).toContain(res.statusCode);
});

test('GET /api/inventory/orders returns 200 or 502', async () => {
  const res = await request(app).get('/api/inventory/orders');
  expect([200, 502]).toContain(res.statusCode);
});

test('GET /api/services/health returns all three service keys', async () => {
  const res = await request(app).get('/api/services/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('nodejs');
  expect(res.body).toHaveProperty('go');
  expect(res.body).toHaveProperty('java');
});
