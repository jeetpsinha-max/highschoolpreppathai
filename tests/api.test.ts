import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, resetRateLimits } from '../server';

describe('PrepPath Repo Backend API Tests', () => {
  beforeEach(() => {
    resetRateLimits();
  });

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

  it('POST /api/gemini/ask rejects oversized prompts with 413', async () => {
    const res = await request(app)
      .post('/api/gemini/ask')
      .send({ prompt: 'a'.repeat(9000) });
    expect(res.status).toBe(413);
  });

  it('POST /api/gemini/ask rejects non-string context with 400', async () => {
    const res = await request(app)
      .post('/api/gemini/ask')
      .send({ prompt: 'hi', context: { nested: true } });
    expect(res.status).toBe(400);
  });

  it('decrements X-RateLimit-Remaining and returns 429 once the limit is exceeded', async () => {
    const first = await request(app).get('/api/health');
    expect(first.headers['x-ratelimit-remaining']).toBe('99');
    const second = await request(app).get('/api/health');
    expect(second.headers['x-ratelimit-remaining']).toBe('98');

    for (let i = 0; i < 98; i++) {
      await request(app).get('/api/health');
    }
    const limited = await request(app).get('/api/health');
    expect(limited.status).toBe(429);
    expect(limited.headers).toHaveProperty('retry-after');
  });
});
