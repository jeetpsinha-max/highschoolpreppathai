import React, { useState } from 'react';
import { X, Check, Crown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onUpgrade: (plan: string) => void;
}

export default function SaaSBillingModal({ isOpen, onClose, currentPlan, onUpgrade }: Props) {
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = (plan: string) => {
    setUpgrading(true);
    setTimeout(() => {
      onUpgrade(plan);
      setUpgrading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              PrepPath Studio SaaS Tier Pricing
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Tier */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 relative">
            <div className="text-xs font-bold text-slate-400 uppercase">Starter Free</div>
            <div className="text-3xl font-display font-extrabold text-white">$0 <span className="text-xs font-normal text-slate-500">/mo</span></div>
            <ul className="text-xs text-slate-300 space-y-2 font-medium">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 3 AI Reels / month</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 720p Render Resolution</li>
              <li className="flex items-center gap-2 text-slate-500"><X className="w-3.5 h-3.5" /> PrepPath Watermark</li>
            </ul>
            <button disabled className="w-full py-2.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-500 text-xs font-semibold">
              Current Free Tier
            </button>
          </div>

          {/* Pro Creator Tier */}
          <div className="bg-gradient-to-b from-indigo-950/60 to-slate-950 border-2 border-indigo-500 rounded-xl p-5 space-y-4 relative shadow-xl glow-blue">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase">POPULAR</span>
            <div className="text-xs font-bold text-indigo-400 uppercase">Pro Creator</div>
            <div className="text-3xl font-display font-extrabold text-white">$29 <span className="text-xs font-normal text-slate-400">/mo</span></div>
            <ul className="text-xs text-slate-200 space-y-2 font-medium">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 100 15s AI Reels / month</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> No Watermark (Clean HD)</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Viral AI Caption Engine</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 60 FPS WEBM/PNG Export</li>
            </ul>
            <button
              onClick={() => handleUpgrade('Pro')}
              disabled={upgrading || currentPlan.includes('Pro')}
              className="w-full py-2.5 rounded-lg studio-btn-primary text-xs font-bold"
            >
              {currentPlan.includes('Pro') ? 'Active Plan' : upgrading ? 'Upgrading...' : 'Upgrade to Pro ($29)'}
            </button>
          </div>

          {/* Agency Tier */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 relative">
            <div className="text-xs font-bold text-amber-400 uppercase">School Advisor</div>
            <div className="text-3xl font-display font-extrabold text-white">$99 <span className="text-xs font-normal text-slate-500">/mo</span></div>
            <ul className="text-xs text-slate-300 space-y-2 font-medium">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Unlimited AI Reels</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Custom School Logos</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> Priority Render Queue</li>
            </ul>
            <button
              onClick={() => handleUpgrade('Agency')}
              disabled={upgrading || currentPlan.includes('Agency')}
              className="w-full py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold"
            >
              {currentPlan.includes('Agency') ? 'Active Plan' : 'Upgrade to Advisor ($99)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
