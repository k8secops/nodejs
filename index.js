const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('Hello from Node.js!'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/add/:a/:b', (req, res) => {
  const a = Number(req.params.a);
  const b = Number(req.params.b);
  res.json({ result: a + b });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Listening on 3000'));
}

module.exports = app;
