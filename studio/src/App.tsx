import { useState, useEffect } from 'react';
import { Film, Zap, Award, Camera } from 'lucide-react';
import type { VideoState } from './types';
import TemplateSelector from './components/TemplateSelector';
import VideoCanvas from './components/VideoCanvas';
import CaptionPanel from './components/CaptionPanel';
import AiPromptBar from './components/AiPromptBar';
import CreditsBar from './components/CreditsBar';
import SaaSBillingModal from './components/SaaSBillingModal';

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
    sceneScript: {
      scene1Hook: '✨ I GOT INTO THE PEDDIE SCHOOL! 🎓',
      scene2Body: 'Months of SSAT practice, 14 essay rewrites, and mock interview prep with @preppathai paid off today!',
      scene3Cta: '📲 Check your acceptance odds for free on PrepPath.ai!',
    },
  });

  const [account, setAccount] = useState({
    plan: 'Pro Creator',
    creditsRemaining: 88,
    creditsTotal: 100,
  });

  const [isBillingOpen, setIsBillingOpen] = useState(false);

  // Fetch live account state from Express SaaS server
  const fetchAccount = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/saas/account');
      const data = await res.json();
      if (data.account) {
        setAccount({
          plan: data.account.plan,
          creditsRemaining: data.account.creditsRemaining,
          creditsTotal: data.account.creditsTotal,
        });
      }
    } catch {
      /* Fallback simulation */
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleStateChange = async (newState: Partial<VideoState>) => {
    setVideoState((prev) => ({ ...prev, ...newState }));

    // Trigger credit reduction call on backend server
    if (newState.userPrompt) {
      try {
        const res = await fetch('http://localhost:8080/api/render-reel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: newState.userPrompt,
            aspectRatio: videoState.aspectRatio,
            schoolName: videoState.schoolName,
          }),
        });
        const data = await res.json();
        if (data.creditsRemaining !== undefined) {
          setAccount((prev) => ({ ...prev, creditsRemaining: data.creditsRemaining }));
        }
      } catch {
        setAccount((prev) => ({ ...prev, creditsRemaining: Math.max(0, prev.creditsRemaining - 1) }));
      }
    }
  };

  const handleUpgradePlan = async (plan: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/saas/upgrade-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.account) {
        setAccount({
          plan: data.account.plan,
          creditsRemaining: data.account.creditsRemaining,
          creditsTotal: data.account.creditsTotal,
        });
      }
    } catch {
      setAccount({
        plan: plan === 'Agency' ? 'Agency / School Advisor' : 'Pro Creator',
        creditsRemaining: plan === 'Agency' ? 999 : 100,
        creditsTotal: plan === 'Agency' ? 999 : 100,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top SaaS Header */}
      <header className="mb-6 border-b border-slate-800/80 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-3">
              PREPPATH STUDIO <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">FULL-STACK SAAS v3.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Full-Stack Express API + React AI Prompt-to-Video Engine & SaaS Billing</p>
          </div>
        </div>

        {/* Live Credits Bar */}
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

      {/* 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template & Inputs (3 cols) */}
        <div className="lg:col-span-3">
          <TemplateSelector videoState={videoState} onChange={handleStateChange} />
        </div>

        {/* Middle Column: Interactive Video Preview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="studio-card p-5 w-full flex flex-col items-center border-slate-800 space-y-4">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" /> 15-Sec Reel Preview
              </span>
              <span className="text-[11px] font-mono text-indigo-400">{videoState.aspectRatio}</span>
            </div>

            <VideoCanvas videoState={videoState} />
          </div>
        </div>

        {/* Right Column: AI Caption Generator (5 cols) */}
        <div className="lg:col-span-5">
          <CaptionPanel templateId={videoState.templateId} schoolName={videoState.schoolName} />
        </div>
      </div>

      <SaaSBillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        currentPlan={account.plan}
        onUpgrade={handleUpgradePlan}
      />
    </div>
  );
}
