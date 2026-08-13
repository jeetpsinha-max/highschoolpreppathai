import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000 + 3600).toString());
  next();
});

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
  } catch (error: any) {
    console.error('Gemini API Error in preppath-repo:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while communicating with Gemini AI.',
      fallback_answer: `[PrepPath AI Fallback] Error contacting Gemini AI. Prompt: "${req.body?.prompt}".`,
      status: 'error'
    });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 PrepPath Repo Server running on http://localhost:${PORT}`);
  });
}
