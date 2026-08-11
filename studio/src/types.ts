export type AspectRatio = '9:16' | '1:1' | '4:5';

export type TemplateId = 
  | 'accepted_story'
  | 'ssat_protip'
  | 'school_comparison'
  | 'essay_before_after'
  | 'interview_simulator'
  | 'custom_prompt';

export interface VideoState {
  templateId: TemplateId;
  aspectRatio: AspectRatio;
  durationSec: number;
  headline: string;
  subheadline: string;
  schoolName: string;
  score: string;
  studentName: string;
  accentColor: string;
  showWatermark: boolean;
  userPrompt: string;
  bgImageUrl?: string; // High-res internet photo background
  bgImageOverlayOpacity?: number;
  pastReelReferenceId?: string;
  brainMeta?: {
    emotionalAngle: string;
    pacingStyle: string;
    bgTrack: 'motivational' | 'lofi' | 'cinematic';
    voiceOverScript: string;
  };
  sceneScript: {
    scene1Hook: string;
    scene2Problem: string;
    scene3Solution: string;
    scene4Cta: string;
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
