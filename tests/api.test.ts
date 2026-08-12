import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('PrepPath Repo Backend API Tests', () => {
  it('GET /api/health returns 200 OK with correct schema and rate limit headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'preppath-repo-backend');
    expect(res.headers).toHaveProperty('x-ratelimit-limit', '100');
  });

  it('POST /api/gemini/ask returns 400 Bad Request when prompt is empty', async () => {
    const res = await request(app)
      .post('/api/gemini/ask')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Bad Request');
  });

  it('POST /api/gemini/ask returns valid or fallback answer', async () => {
    const res = await request(app)
      .post('/api/gemini/ask')
      .send({ prompt: 'How to prepare for SAT Math?' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/invalid returns 404', async () => {
    const res = await request(app).get('/api/invalid');
    expect(res.status).toBe(404);
  });
});
