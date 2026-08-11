export interface ViralTrend {
  hashtag: string;
  avgViews: string;
  topHookFormat: string;
  retentionScore: number;
  trendingAudio: string;
}

export const INSTAGRAM_VIRAL_TRENDS: ViralTrend[] = [
  {
    hashtag: '#BoardingSchoolAdmissions',
    avgViews: '84.5K',
    topHookFormat: 'Accepted Reaction + Confetti Burst',
    retentionScore: 98,
    trendingAudio: 'Cinematic Hype Beat (Viral)',
  },
  {
    hashtag: '#SSATPrep',
    avgViews: '62.1K',
    topHookFormat: 'SSAT 2300 Verbal Hack in 15s',
    retentionScore: 95,
    trendingAudio: 'Lofi Focus Beats #4',
  },
  {
    hashtag: '#HighSchoolAccepted',
    avgViews: '112.4K',
    topHookFormat: 'Peddie vs Andover vs Exeter Matrix',
    retentionScore: 99,
    trendingAudio: 'Motivation Bass Drop',
  },
  {
    hashtag: '#PrivateSchoolLife',
    avgViews: '48.9K',
    topHookFormat: 'Essay Before vs After Transformation',
    retentionScore: 92,
    trendingAudio: 'Ambient Ambient Chill',
  },
];

export interface ViewOptimizationReport {
  predictedViews: string;
  viralScore: number;
  hookRetentionPct: number;
  algorithmScore: string;
  optimizations: string[];
}

export function analyzeReelForViralViews(
  schoolName: string,
  templateId: string,
  userPrompt: string
): ViewOptimizationReport {
  const promptLower = userPrompt.toLowerCase();

  let viralScore = 94;
  let predictedViews = '35.4K – 82.0K';
  let hookRetentionPct = 96.2;
  const optimizations: string[] = [];

  if (templateId === 'accepted_story' || promptLower.includes('accepted')) {
    viralScore = 98;
    predictedViews = '68.0K – 145.0K';
    hookRetentionPct = 98.4;
    optimizations.push('🔥 High Retention: Confetti bursts in the first 0.5s increase 3-second completion rate by +28%.');
    optimizations.push('💬 Comment CTA: Asking viewers to comment "GRAD" boosts Instagram algorithm rank.');
  } else if (templateId === 'ssat_protip') {
    viralScore = 95;
    predictedViews = '42.0K – 98.0K';
    hookRetentionPct = 95.8;
    optimizations.push('🧠 Hack Angle: Showing a 99th percentile SSAT question sparks immediate saves & shares.');
  } else if (templateId === 'school_comparison') {
    viralScore = 99;
    predictedViews = '85.0K – 180.0K';
    hookRetentionPct = 99.1;
    optimizations.push('⚔️ High Engagement: Side-by-side school matrices trigger active debate in comment section.');
  } else {
    optimizations.push('✍️ Before/After Transformation: Visual proof builds massive trust for admissions tools.');
  }

  return {
    predictedViews,
    viralScore,
    hookRetentionPct,
    algorithmScore: `${viralScore}/100 Top 1% Viral Index`,
    optimizations,
  };
}
