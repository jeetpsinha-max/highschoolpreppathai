import { GeneratedCaption, TemplateId } from '../types';

export function generateSmartCaption(
  templateId: TemplateId,
  schoolName: string,
  targetAudience: 'students' | 'parents' | 'counselors' = 'students'
): GeneratedCaption {
  const school = schoolName || 'Top Boarding Schools';

  if (targetAudience === 'students') {
    switch (templateId) {
      case 'accepted_story':
        return {
          targetAudience: '8th-10th Grade Applicants',
          hook: `✨ SHUT THE FRONT DOOR. I GOT INTO ${school.toUpperCase()}! 🎓`,
          body: `Months of late-night SSAT vocab practice, 14 essay rewrites, and mock interview prep with @preppathai finally paid off today!\n\nIf you're applying to private high schools this season, do NOT sleep on personalized essay positioning and authentic interview stories.`,
          callToAction: `💬 Drop a "🎓" in the comments to get my exact SSAT formula sheet sent to your DMs!`,
          hashtags: [`#${school.replace(/\s/g, '')}`, '#PrivateSchoolAccepted', '#ClassOf2029', '#BoardingSchool', '#PrepPathAI', '#SSATPrep', '#Accepted'],
          bestPostingTime: '7:45 PM EST (Peak Student Scrolling Time)',
          estimatedReach: '14.8K – 32.5K Plays',
        };
      case 'ssat_protip':
        return {
          targetAudience: 'SSAT Test Takers',
          hook: `🚨 STOP LOSING 40+ POINTS ON SSAT ANALOGIES! 🧠`,
          body: `Here is the #1 secret top 1% SSAT scorers use on the Verbal section:\n\nCreate a "Bridge Sentence" before looking at any answer choices. If the relationship doesn't fit your sentence seamlessly, cross it out immediately.`,
          callToAction: `📌 Save this reel so you can review right before test day! Tap link in bio to test your score on PrepPath AI.`,
          hashtags: ['#SSATPrep', '#BoardingSchoolAdmissions', '#PrepPath', '#StudyHacks', '#PeddieSchool', '#Andover', '#Exeter'],
          bestPostingTime: '6:15 PM EST',
          estimatedReach: '22.1K – 48.0K Plays',
        };
      case 'school_comparison':
        return {
          targetAudience: 'School Discovery Applicants',
          hook: `⚔️ PEDDIE vs ANDOVER vs EXETER: WHICH ONE ACTUALLY FITS YOU? 🏫`,
          body: `Don't just pick based on name recognition! Here's how the top 3 boarding schools compare in endowment size, Harkness vs Traditional learning, and athletic culture.\n\nPeddie: Community + Arts + Elite Swimming\nAndover: 1,100+ Students + Huge Endowment\nExeter: Harkness Method + Mathematics Powerhouse`,
          callToAction: `👉 Which school is your dream target? Comment below!`,
          hashtags: ['#BoardingSchool', '#PeddieSchool', '#PhillipsAndover', '#PhillipsExeter', '#HighSchoolSearch', '#PrepPathAI'],
          bestPostingTime: '8:00 PM EST',
          estimatedReach: '18.5K – 39.2K Plays',
        };
      case 'essay_before_after':
        return {
          targetAudience: 'Admissions Essay Writers',
          hook: `✍️ HOW THIS ESSAY UPGRADE BOOSTED MY ACCEPTANCE ODDS BY 24%! 🔥`,
          body: `Admissions officers read 50+ essays a day. Generic statements like "I am a hardworking team player" get skipped.\n\nSee how we transformed line 4 to show specific impact and vulnerability using PrepPath's AI Essay Coach!`,
          callToAction: `📲 Want your essay reviewed line-by-line? Click the link in bio to try PrepPath AI Essay Coach!`,
          hashtags: ['#AdmissionsEssay', '#PrepPathAI', '#HighSchoolAdmissions', '#EssayTips', '#Choate', '#Lawrenceville'],
          bestPostingTime: '5:30 PM EST',
          estimatedReach: '12.4K – 28.0K Plays',
        };
      default:
        return {
          targetAudience: 'Interview Prep Applicants',
          hook: `🎙️ 3 QUESTIONS EVERY BOARDING SCHOOL INTERVIEWER WILL ASK YOU! 🗣️`,
          body: `1. "Tell me about a time you failed and what you learned."\n2. "Why ${school} specifically?"\n3. "What will you contribute outside the classroom?"\n\nPracticing these aloud is 80% of the battle.`,
          callToAction: `🔥 Save this reel and practice in the mirror tonight! Link in bio for full AI mock interview sessions.`,
          hashtags: ['#InterviewPrep', '#PrivateSchoolAdmissions', '#PrepPathAI', '#Peddie', '#BoardingSchoolLife'],
          bestPostingTime: '7:15 PM EST',
          estimatedReach: '19.0K – 41.2K Plays',
        };
    }
  } else {
    // Parents Audience
    return {
      targetAudience: 'Parents of 7th-9th Graders',
      hook: `💡 PARENTS: THE REAL TRUTH ABOUT ${school.toUpperCase()} ADMISSIONS 🏫`,
      body: `Navigating secondary school admissions can feel overwhelming. Beyond test scores, admissions committees look for character alignment, athletic/arts contributions, and authentic student voice.\n\nPrepPath AI helps families track 1,750+ schools, estimate financial aid grants, and prepare for campus visits with confidence.`,
      callToAction: `🔗 Visit PrepPath.ai to check your student's acceptance odds today.`,
      hashtags: ['#ParentingTips', '#PrivateEducation', '#BoardingSchoolParents', '#PrepPathAI', '#FinancialAid', '#SSAT'],
      bestPostingTime: '12:30 PM EST / 9:00 PM EST',
      estimatedReach: '9.2K – 21.0K Plays',
    };
  }
}
