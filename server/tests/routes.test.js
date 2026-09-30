const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  test('returns 200 with a success message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: 'Server is running.' });
  });

  test('sets helmet security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('unknown routes', () => {
  test('returns 404 with a clear message', async () => {
    const res = await request(app).get('/api/definitely-not-a-real-route');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Route not found/);
  });
});

describe('POST /api/reviews validation', () => {
  test('rejects a request missing sourceCode', async () => {
    const res = await request(app).post('/api/reviews').send({ language: 'python' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/authorized|authentication/i);
  });

  test('rejects a request missing language', async () => {
    const res = await request(app).post('/api/reviews').send({ sourceCode: 'x = 1' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/authorized|authentication/i);
  });
});

describe('GET /api/reviews/:id with a malformed id', () => {
  test('returns 400, not a raw 500', async () => {
    const res = await request(app).get('/api/reviews/not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid review ID/);
  });
});

describe('CORS', () => {
  test('allowed origin gets its own origin echoed back', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
