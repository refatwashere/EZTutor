const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.JWT_SECRET = 'testsecret';
process.env.SQLITE_PATH = ':memory:';

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

test('Auth signup/login and recents flow', async () => {
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'teacher@example.com', password: 'password123' });
  assert.equal(signup.statusCode, 200);
  assert.ok(signup.body.token);

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'teacher@example.com', password: 'password123' });
  assert.equal(login.statusCode, 200);
  assert.ok(login.body.token);

  const token = login.body.token;

  const me = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(me.statusCode, 200);
  assert.equal(me.body.email, 'teacher@example.com');

  const create = await request(app)
    .post('/api/recents')
    .set('Authorization', `Bearer ${token}`)
    .send({ type: 'lesson', title: 'Lesson Plan', subtitle: 'Math • Fractions' });
  assert.equal(create.statusCode, 201);

  const list = await request(app)
    .get('/api/recents')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(list.statusCode, 200);
  assert.equal(Array.isArray(list.body.recents), true);
  assert.equal(list.body.recents.length, 1);

  const clear = await request(app)
    .delete('/api/recents')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(clear.statusCode, 200);
});
