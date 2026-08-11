import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ── In-Memory SaaS User DB ──────────────────────────────────
let userAccount = {
  id: 'user_12345',
  email: 'creator@preppath.ai',
  plan: 'Pro Creator',
  creditsRemaining: 88,
  creditsTotal: 100,
  watermarkDisabled: true,
  renderQueueCount: 0,
  recentReels: [
    {
      id: 'reel_1',
      title: 'Peddie Acceptance Story',
      format: '9:16 Reel',
      createdAt: '2026-08-11T16:20:00Z',
      viewsEstimate: '24.2K',
    },
    {
      id: 'reel_2',
      title: 'SSAT 2300 Verbal Hack',
      format: '9:16 Reel',
      createdAt: '2026-08-10T14:15:00Z',
      viewsEstimate: '18.9K',
    },
  ],
};

// ── Endpoints ──────────────────────────────────────────────

// GET /api/saas/account
app.get('/api/saas/account', (req, res) => {
  res.json({
    status: 'success',
    account: userAccount,
  });
});

// POST /api/saas/upgrade-plan
app.post('/api/saas/upgrade-plan', (req, res) => {
  const { plan } = req.body;
  if (plan === 'Agency') {
    userAccount.plan = 'Agency / School Advisor';
    userAccount.creditsTotal = 999;
    userAccount.creditsRemaining = 999;
    userAccount.watermarkDisabled = true;
  } else if (plan === 'Pro') {
    userAccount.plan = 'Pro Creator';
    userAccount.creditsTotal = 100;
    userAccount.creditsRemaining = 100;
    userAccount.watermarkDisabled = true;
  }

  res.json({
    status: 'success',
    message: `Upgraded to ${userAccount.plan} successfully!`,
    account: userAccount,
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

  // Deduct 1 credit
  userAccount.creditsRemaining -= 1;

  const newReel = {
    id: `reel_${Date.now()}`,
    title: prompt || `${schoolName} Reel`,
    format: aspectRatio || '9:16 Reel',
    createdAt: new Date().toISOString(),
    viewsEstimate: `${(15 + Math.random() * 25).toFixed(1)}K`,
  };

  userAccount.recentReels.unshift(newReel);

  res.json({
    status: 'success',
    message: '15-Second AI Reel Generated & Rendered!',
    reel: newReel,
    creditsRemaining: userAccount.creditsRemaining,
  });
});

app.listen(PORT, () => {
  console.log(`⚡ PrepPath Studio SaaS Server running on http://localhost:${PORT}`);
});
