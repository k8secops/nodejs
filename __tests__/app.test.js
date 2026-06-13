const request = require('supertest');
const app = require('../index');

test('GET / returns greeting', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('Hello');
});

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

test('GET /add/:a/:b returns sum', async () => {
  const res = await request(app).get('/add/2/3');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ result: 5 });
});
