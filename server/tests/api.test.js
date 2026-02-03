const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../index');

test('GET /api returns status payload', async () => {
  const res = await request(app).get('/api');
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { status: 'EZTutor API' });
});

test('POST /api/generate-lesson validates input', async () => {
  const res = await request(app).post('/api/generate-lesson').send({});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'subject and topic are required');
});

test('POST /api/generate-quiz validates input', async () => {
  const res = await request(app).post('/api/generate-quiz').send({});
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'topic and difficulty are required');
});

test('POST /api/generate-quiz rejects invalid difficulty', async () => {
  const res = await request(app)
    .post('/api/generate-quiz')
    .send({ topic: 'Fractions', difficulty: 'expert' });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'difficulty must be one of: basic, intermediate, advanced');
});

test('GET /health returns uptime and timestamp', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.uptimeSeconds, 'number');
  assert.equal(typeof res.body.timestamp, 'string');
});
