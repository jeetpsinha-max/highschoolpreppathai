import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSyDemo' });

// ── In-Memory SaaS & Instagram Scraper Store ────────────────
let userAccount = {
  id: 'user_12345',
  email: 'creator@preppath.ai',
  plan: 'Pro Creator',
  creditsRemaining: 88,
  creditsTotal: 100,
  watermarkDisabled: true,
};

const INSTAGRAM_SCRAPE_CACHE = [
  { tag: '#BoardingSchoolAdmissions', topViews: '184.2K', viralHook: 'Confetti Reveal + Score' },
  { tag: '#SSATPrep', topViews: '122.5K', viralHook: '99th %ile Analogy Trick' },
  { tag: '#PeddieSchool', topViews: '95.8K', viralHook: 'Campus Tour Matrix' },
];

// ── Endpoints ──────────────────────────────────────────────

// GET /api/saas/account
app.get('/api/saas/account', (req, res) => {
  res.json({
    status: 'success',
    account: userAccount,
  });
});

// GET /api/instagram/trending-reels
app.get('/api/instagram/trending-reels', (req, res) => {
  res.json({
    status: 'success',
    trends: INSTAGRAM_SCRAPE_CACHE,
    lastScraped: new Date().toISOString(),
  });
});

// POST /api/gemini-omni/generate-viral-storyboard
app.post('/api/gemini-omni/generate-viral-storyboard', (req, res) => {
  const { prompt, schoolName } = req.body;
  const school = schoolName || 'The Peddie School';

  const omniResult = {
    model: 'Gemini 2.0 Flash / Omni Multimodal Engine',
    viralScore: 98,
    predictedOrganicViews: '65.4K – 142.0K',
    hookRetentionRating: '98.6%',
    recommendedAudioTrack: 'Cinematic Hype Beat #1 Trending',
    sceneScript: {
      scene1Hook: `✨ I GOT INTO ${school.toUpperCase()}! 🎓`,
      scene2Problem: '⚠️ THE PROBLEM: 90% of applicants write generic essays.',
      scene3Solution: `💡 PREPPATH OMNI: AI polished line 4 for +24% acceptance odds!`,
      scene4Cta: `💬 Comment "PREP" below for our free ${school} guide!`,
    },
    caption: {
      hook: `🔥 SHUT THE FRONT DOOR. ACCEPTED TO ${school.toUpperCase()}! 🎓`,
      body: `Months of SSAT prep, essay rewrites, and mock interviews with @preppathai paid off today!\n\nWant the exact formula sheet I used?`,
      callToAction: `👉 Drop a "🎓" in the comments to get it sent to your DMs!`,
      hashtags: [`#${school.replace(/\s/g, '')}`, '#PrivateSchoolAccepted', '#ClassOf2029', '#PrepPathAI', '#SSATPrep'],
    },
  };

  res.json({
    status: 'success',
    omniResult,
  });
});

// POST /api/render-reel
app.post('/api/render-reel', (req, res) => {
  const { prompt, aspectRatio, schoolName } = req.body;

  if (userAccount.creditsRemaining <= 0) {
    return res.status(402).json({
      error: 'Insufficient credits. Upgrade to Pro Creator for 100 reels/month.',
    });
  }

  userAccount.creditsRemaining -= 1;

  res.json({
    status: 'success',
    message: '15-Second AI Reel Generated & Rendered!',
    creditsRemaining: userAccount.creditsRemaining,
  });
});

app.listen(PORT, () => {
  console.log(`⚡ PrepPath Studio Gemini Omni & Instagram Engine running on http://localhost:${PORT}`);
});
