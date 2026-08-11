import type { VideoState } from '../types';

export interface PastReelReference {
  id: string;
  title: string;
  hookStyle: string;
  accentColor: string;
  avgViews: string;
  viralScore: number;
}

export const PAST_REELS_LIBRARY: PastReelReference[] = [
  {
    id: 'past_1',
    title: 'How I got into Peddie School (2300 SSAT)',
    hookStyle: 'Aspirational Shock',
    accentColor: '#3B82F6',
    avgViews: '42.8K',
    viralScore: 98,
  },
  {
    id: 'past_2',
    title: 'Top 3 SSAT Verbal Analogies Hacks',
    hookStyle: 'Curiosity Secret',
    accentColor: '#F59E0B',
    avgViews: '38.2K',
    viralScore: 95,
  },
  {
    id: 'past_3',
    title: 'Essay Rewrite: +24% Acceptance Odds',
    hookStyle: 'Before vs After Proof',
    accentColor: '#8B5CF6',
    avgViews: '29.5K',
    viralScore: 92,
  },
  {
    id: 'past_4',
    title: 'Peddie vs Andover vs Exeter Comparison',
    hookStyle: 'Debate / Vs Matrix',
    accentColor: '#10B981',
    avgViews: '51.0K',
    viralScore: 99,
  },
];

export interface BrainDecision {
  emotionalAngle: string;
  pacingStyle: string;
  accentColor: string;
  bgTrack: 'motivational' | 'lofi' | 'cinematic';
  schoolName: string;
  score: string;
  voiceOverScript: string;
  sceneScript: {
    scene1Hook: string;
    scene2Problem: string;
    scene3Solution: string;
    scene4Cta: string;
  };
}

export function runPrepPathBrain(
  userPrompt: string,
  referenceReel?: PastReelReference
): BrainDecision {
  const promptLower = userPrompt.toLowerCase();

  // Extract School
  let schoolName = referenceReel?.title.includes('Peddie') ? 'The Peddie School' : 'The Peddie School';
  if (promptLower.includes('andover')) schoolName = 'Phillips Andover';
  else if (promptLower.includes('exeter')) schoolName = 'Phillips Exeter Academy';
  else if (promptLower.includes('choate')) schoolName = 'Choate Rosemary Hall';
  else if (promptLower.includes('lawrenceville')) schoolName = 'The Lawrenceville School';

  // Extract Score
  let score = '2280';
  const scoreMatch = promptLower.match(/\b(1[5-9]\d{2}|2[0-4]\d{2})\b/);
  if (scoreMatch) score = scoreMatch[0];

  // Determine Brain Decision & Storyboard Strategy
  if (promptLower.includes('essay') || promptLower.includes('writing')) {
    return {
      emotionalAngle: 'Vulnerability & High Transformation',
      pacingStyle: 'Kinetic Text Wipe (0.5s beats)',
      accentColor: referenceReel?.accentColor || '#8B5CF6',
      bgTrack: 'lofi',
      schoolName,
      score: '+24% Acceptance Boost',
      voiceOverScript: `Applying to ${schoolName}? Most students make the mistake of using generic statements in their essay. Here is how PrepPath AI rewrote line 4 to boost acceptance odds by 24 percent.`,
      sceneScript: {
        scene1Hook: `✍️ STOP WRITING GENERIC ESSAYS FOR ${schoolName.toUpperCase()}`,
        scene2Problem: '❌ COMMON MISTAKE: "I am a hardworking student who loves learning."',
        scene3Solution: '✅ PREPPATH AI REWRITE: "Surmounting 40-hr robotics challenges taught me resilience."',
        scene4Cta: '📲 Get your essay scored line-by-line on PrepPath.ai!',
      },
    };
  } else if (promptLower.includes('ssat') || promptLower.includes('score') || promptLower.includes('math')) {
    return {
      emotionalAngle: 'High Energy Hack & Social Proof',
      pacingStyle: 'Zoom Camera & Countdown Flash',
      accentColor: referenceReel?.accentColor || '#F59E0B',
      bgTrack: 'motivational',
      schoolName,
      score: `${score} (99th %ile)`,
      voiceOverScript: `Want a ${score} SSAT score for ${schoolName}? The number one secret top 1 percent scorers use is Bridge Sentences for Verbal Analogies.`,
      sceneScript: {
        scene1Hook: `🧠 HOW TO GET A ${score} SSAT SCORE FOR ${schoolName.toUpperCase()}`,
        scene2Problem: '⚠️ THE PROBLEM: Losing 40+ points guessing on Verbal Analogies.',
        scene3Solution: '💡 THE HACK: Form a strict "Bridge Sentence" before looking at choices.',
        scene4Cta: '🎓 Predict your exact SSAT score on PrepPath.ai today!',
      },
    };
  } else {
    // General Acceptance & Viral Reel
    return {
      emotionalAngle: 'Aspirational Triumph & Confetti Reveal',
      pacingStyle: 'Ken Burns Scale & Particle Pulse',
      accentColor: referenceReel?.accentColor || '#3B82F6',
      bgTrack: 'cinematic',
      schoolName,
      score: `${score} (99th %ile)`,
      voiceOverScript: `I got accepted into ${schoolName}! Months of SSAT practice, 14 essay rewrites, and mock interview prep with PrepPath AI paid off today.`,
      sceneScript: {
        scene1Hook: `✨ OFFICIAL ACCEPTANCE TO ${schoolName.toUpperCase()}! 🎓`,
        scene2Problem: '⏳ 6 Months of SSAT Practice & Essay Drafting...',
        scene3Solution: '📈 PrepPath AI predicted a 94% acceptance probability!',
        scene4Cta: '🔥 Check your acceptance odds for free on PrepPath.ai!',
      },
    };
  }
}
