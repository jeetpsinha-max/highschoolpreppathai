import React from 'react';
import { Zap, Crown, ShieldCheck } from 'lucide-react';

interface Props {
  plan: string;
  creditsRemaining: number;
  creditsTotal: number;
  onOpenBilling: () => void;
}

export default function CreditsBar({ plan, creditsRemaining, creditsTotal, onOpenBilling }: Props) {
  const percentage = Math.round((creditsRemaining / creditsTotal) * 100);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4 font-sans text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white uppercase">{plan}</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
          <span className="text-slate-400 font-mono">Credits:</span>
          <span className="font-mono font-bold text-indigo-400">{creditsRemaining} / {creditsTotal}</span>
          <div className="w-20 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>

      <button
        onClick={onOpenBilling}
        className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold transition flex items-center gap-1.5 shadow-md"
      >
        <Zap className="w-3.5 h-3.5" /> Upgrade Plan
      </button>
    </div>
  );
}
