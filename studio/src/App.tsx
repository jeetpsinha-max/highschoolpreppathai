import { useState } from 'react';
import { Film, Zap, Award, Camera, Cpu } from 'lucide-react';
import type { VideoState } from './types';
import TemplateSelector from './components/TemplateSelector';
import VideoCanvas from './components/VideoCanvas';
import CaptionPanel from './components/CaptionPanel';
import AiPromptBar from './components/AiPromptBar';
import CreditsBar from './components/CreditsBar';
import SaaSBillingModal from './components/SaaSBillingModal';
import BrandMemory from './components/BrandMemory';
import { runPrepPathBrain, PastReelReference } from './utils/brainEngine';

export default function App() {
  const [videoState, setVideoState] = useState<VideoState>({
    templateId: 'accepted_story',
    aspectRatio: '9:16',
    durationSec: 15,
    headline: 'OFFICIAL ACCEPTANCE',
    subheadline: 'PrepPath AI Applicant',
    schoolName: 'The Peddie School',
    score: '2280 (99th %ile)',
    studentName: 'Alex',
    accentColor: '#3B82F6',
    showWatermark: true,
    userPrompt: 'Create a 15-second viral reel about getting accepted into Peddie School',
    brainMeta: {
      emotionalAngle: 'Aspirational Triumph & Confetti Reveal',
      pacingStyle: 'Ken Burns Scale & Particle Pulse',
      bgTrack: 'cinematic',
      voiceOverScript: 'I got accepted into The Peddie School using PrepPath AI! Months of SSAT practice and essay rewrites paid off.',
    },
    sceneScript: {
      scene1Hook: '✨ I GOT INTO THE PEDDIE SCHOOL! 🎓',
      scene2Problem: '⏳ 6 Months of SSAT Practice & Essay Drafting...',
      scene3Solution: '📈 PrepPath AI predicted a 94% acceptance probability!',
      scene4Cta: '🔥 Check your acceptance odds for free on PrepPath.ai!',
    },
  });

  const [account, setAccount] = useState({
    plan: 'Pro Creator',
    creditsRemaining: 88,
    creditsTotal: 100,
  });

  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const handleStateChange = async (newState: Partial<VideoState>) => {
    setVideoState((prev) => ({ ...prev, ...newState }));

    if (newState.userPrompt) {
      // Run the AI Brain Decision Engine
      const brainDecision = runPrepPathBrain(newState.userPrompt);
      setVideoState((prev) => ({
        ...prev,
        schoolName: brainDecision.schoolName,
        score: brainDecision.score,
        accentColor: brainDecision.accentColor,
        brainMeta: {
          emotionalAngle: brainDecision.emotionalAngle,
          pacingStyle: brainDecision.pacingStyle,
          bgTrack: brainDecision.bgTrack,
          voiceOverScript: brainDecision.voiceOverScript,
        },
        sceneScript: brainDecision.sceneScript,
      }));
    }
  };

  const handleSelectPastReelReference = (reel: PastReelReference) => {
    const brainDecision = runPrepPathBrain(videoState.userPrompt, reel);
    setVideoState((prev) => ({
      ...prev,
      pastReelReferenceId: reel.id,
      accentColor: reel.accentColor,
      brainMeta: {
        emotionalAngle: brainDecision.emotionalAngle,
        pacingStyle: brainDecision.pacingStyle,
        bgTrack: brainDecision.bgTrack,
        voiceOverScript: brainDecision.voiceOverScript,
      },
      sceneScript: brainDecision.sceneScript,
    }));
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* SaaS Header */}
      <header className="mb-6 border-b border-slate-800/80 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-3">
              PREPPATH STUDIO <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">AI BRAIN ENGINE v4.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">AI Storyboard Brain, Past Video Pattern Memory & 4-Scene 15s Reel Generator</p>
          </div>
        </div>

        <CreditsBar
          plan={account.plan}
          creditsRemaining={account.creditsRemaining}
          creditsTotal={account.creditsTotal}
          onOpenBilling={() => setIsBillingOpen(true)}
        />
      </header>

      {/* AI Prompt Input Bar */}
      <div className="mb-6">
        <AiPromptBar onGenerate={handleStateChange} />
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Brand Memory & Preset Selectors (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <BrandMemory
            activeReferenceId={videoState.pastReelReferenceId}
            onSelectReference={handleSelectPastReelReference}
            brainMeta={videoState.brainMeta ? { ...videoState.brainMeta, schoolName: videoState.schoolName, score: videoState.score, sceneScript: videoState.sceneScript } : undefined}
          />
          <TemplateSelector videoState={videoState} onChange={handleStateChange} />
        </div>

        {/* Middle Column: Interactive 4-Scene Canvas Preview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="studio-card p-5 w-full flex flex-col items-center border-slate-800 space-y-4">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" /> 15-Sec AI Brain Reel
              </span>
              <span className="text-[11px] font-mono text-indigo-400">{videoState.aspectRatio}</span>
            </div>

            <VideoCanvas videoState={videoState} />
          </div>
        </div>

        {/* Right Column: AI Caption Generator (4 cols) */}
        <div className="lg:col-span-4">
          <CaptionPanel templateId={videoState.templateId} schoolName={videoState.schoolName} />
        </div>
      </div>

      <SaaSBillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        currentPlan={account.plan}
        onUpgrade={(plan) => setAccount((p) => ({ ...p, plan }))}
      />
    </div>
  );
}
