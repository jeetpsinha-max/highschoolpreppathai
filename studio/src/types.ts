export type AspectRatio = '9:16' | '1:1' | '4:5';

export type TemplateId = 
  | 'accepted_story'
  | 'ssat_protip'
  | 'school_comparison'
  | 'essay_before_after'
  | 'interview_simulator'
  | 'custom_prompt';

export interface StudioTemplate {
  id: TemplateId;
  title: string;
  category: 'Reels' | 'Carousels' | 'Stories';
  description: string;
  accentColor: string;
  defaultHeadline: string;
  defaultSubheadline: string;
  defaultSchool: string;
  previewGradient: string;
}

export interface VideoState {
  templateId: TemplateId;
  aspectRatio: AspectRatio;
  durationSec: number; // 15 seconds
  headline: string;
  subheadline: string;
  schoolName: string;
  score: string;
  studentName: string;
  accentColor: string;
  showWatermark: boolean;
  userPrompt: string;
  sceneScript: {
    scene1Hook: string;
    scene2Body: string;
    scene3Cta: string;
  };
}

export interface GeneratedCaption {
  hook: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  bestPostingTime: string;
  targetAudience: string;
  estimatedReach: string;
}
