import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3002;

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000;
const MAX_PROMPT_CHARS = 8000;

// Comma-separated list of allowed origins; unset means allow any origin (dev default).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '64kb' }));

/**
 * Fixed-window, per-IP rate limiter kept in memory. Good enough for a single
 * instance; swap for a shared store (e.g. Redis) if this is ever scaled out.
 */
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function resetRateLimits() {
  rateBuckets.clear();
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  let bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;

  const remaining = Math.max(0, RATE_LIMIT_MAX - bucket.count);
  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      status: 'error',
    });
  }
  next();
});

// Opportunistically drop expired buckets so the map can't grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(key);
  }
}, 60 * 1000).unref();

const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

app.get('/api/health', (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.status(200).json({
    status: 'ok',
    service: 'preppath-repo-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(apiKey && apiKey.length > 0)
  });
});

app.post('/api/gemini/ask', async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction, context } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Field "prompt" is required and must be a non-empty string.',
        status: 'error'
      });
    }

    const extraLength =
      (typeof context === 'string' ? context.length : 0) +
      (typeof systemInstruction === 'string' ? systemInstruction.length : 0);
    if (prompt.length + extraLength > MAX_PROMPT_CHARS) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Prompt, context and system instruction must total at most ${MAX_PROMPT_CHARS} characters.`,
        status: 'error'
      });
    }
    if (
      (context !== undefined && typeof context !== 'string') ||
      (systemInstruction !== undefined && typeof systemInstruction !== 'string')
    ) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Fields "context" and "systemInstruction" must be strings when provided.',
        status: 'error'
      });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        answer: `[PrepPath AI Fallback] Automated study plan guidance for: "${prompt}". Configure GEMINI_API_KEY for full AI capability.`,
        model: 'gemini-2.5-flash-fallback',
        status: 'fallback',
        timestamp: new Date().toISOString()
      });
    }

    const combinedPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: combinedPrompt,
      config: systemInstruction ? { systemInstruction } : undefined
    });

    const answer = response.text || 'No response generated from Gemini AI.';

    return res.status(200).json({
      answer,
      model: 'gemini-2.5-flash',
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Gemini API Error in preppath-repo:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while communicating with Gemini AI.',
      fallback_answer: '[PrepPath AI Fallback] The AI service is temporarily unavailable. Please try again shortly.',
      status: 'error'
    });
  }
});

app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', message: `No route for ${req.method} ${req.path}`, status: 'error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 PrepPath Repo Server running on http://localhost:${PORT}`);
  });
}
