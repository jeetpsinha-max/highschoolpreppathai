import type { VideoState } from '../types';

export function processAiPrompt(promptText: string): Partial<VideoState> {
  const text = promptText.toLowerCase();

  // Extract school if mentioned
  let schoolName = 'The Peddie School';
  if (text.includes('andover')) schoolName = 'Phillips Andover';
  else if (text.includes('exeter')) schoolName = 'Phillips Exeter Academy';
  else if (text.includes('choate')) schoolName = 'Choate Rosemary Hall';
  else if (text.includes('lawrenceville')) schoolName = 'The Lawrenceville School';

  // Extract score if mentioned
  let score = '2280';
  const scoreMatch = text.match(/\b(1[5-9]\d{2}|2[0-4]\d{2})\b/);
  if (scoreMatch) score = scoreMatch[0];

  // Topic determination
  if (text.includes('ssat') || text.includes('score') || text.includes('math') || text.includes('vocab')) {
    return {
      templateId: 'ssat_protip',
      schoolName,
      score: `${score} (99th %ile)`,
      headline: 'HOW TO SCORE 2300+ ON THE SSAT',
      subheadline: 'The 3-Step Strategy Top Applicants Use',
      sceneScript: {
        scene1Hook: `🧠 HOW TO SCORE 2300+ FOR ${schoolName.toUpperCase()}`,
        scene2Problem: '1. Master Verbal Analogies with Bridge Sentences\n2. Skip Unsure Math Questions (+0 vs -0.25)',
        scene3Solution: '3. Practice 50+ Timed Passages on PrepPath AI',
        scene4Cta: '🎓 Tap link in bio to predict your SSAT score on PrepPath.ai!',
      },
    };
  } else if (text.includes('essay') || text.includes('writing') || text.includes('prompt')) {
    return {
      templateId: 'essay_before_after',
      schoolName,
      score: '+24% Acceptance Odds',
      headline: 'DO NOT WRITE THIS IN YOUR ESSAY',
      subheadline: 'Line-by-Line AI Essay Transformation',
      sceneScript: {
        scene1Hook: `✍️ HOW THIS ESSAY UPGRADE GOT ME INTO ${schoolName.toUpperCase()}`,
        scene2Problem: '❌ BEFORE: "I am a very hardworking student."',
        scene3Solution: '✅ AFTER: "Surmounting 40-hr robotics challenges taught me..."',
        scene4Cta: '📲 Get your essay reviewed line-by-line on PrepPath AI!',
      },
    };
  } else if (text.includes('interview') || text.includes('question') || text.includes('harkness')) {
    return {
      templateId: 'interview_simulator',
      schoolName,
      score: '100% Prepared',
      headline: 'MOCK INTERVIEW SIMULATION',
      subheadline: 'Top 3 Boarding School Questions',
      sceneScript: {
        scene1Hook: `🎙️ 3 QUESTIONS ${schoolName.toUpperCase()} WILL ASK YOU`,
        scene2Problem: '1. "Why our school specifically?"\n2. "Tell me about a setback you overcame."',
        scene3Solution: '3. "How do you handle different perspectives?"',
        scene4Cta: '🔥 Practice AI mock interviews live on PrepPath.ai!',
      },
    };
  } else {
    // Default Acceptance Story
    return {
      templateId: 'accepted_story',
      schoolName,
      score: `${score} (99th %ile)`,
      headline: 'OFFICIAL ACCEPTANCE STORY',
      subheadline: 'PrepPath AI Success Story',
      sceneScript: {
        scene1Hook: `✨ I GOT INTO ${schoolName.toUpperCase()}! 🎓`,
        scene2Problem: `Months of SSAT practice, 14 essay rewrites,`,
        scene3Solution: `and mock interview prep with @preppathai paid off today!`,
        scene4Cta: '📲 Check your acceptance odds for free on PrepPath.ai!',
      },
    };
  }
}
